import {
  type AddChainWalletParams,
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  Chain,
  type ConnectConfig,
  SwapKitError,
  type SwapParams,
} from "@swapkit/helpers";
import type { BaseEVMWallet } from "@swapkit/toolbox-evm";

import {
  getExplorerAddressUrl as getAddressUrl,
  getExplorerTxUrl as getTxUrl,
} from "./helpers/explorerUrls.ts";
import type { Apis, SwapKitPluginInterface, SwapKitWallet, Wallet } from "./types.ts";

export function SwapKit<
  Plugins extends { [key in string]: SwapKitPluginInterface<{ [key in string]: Todo }> },
  Wallets extends { [key in string]: SwapKitWallet<NotWorth[]> },
>({
  apis = {},
  config = {},
  plugins,
  rpcUrls = {},
  stagenet = false,
  wallets,
}: {
  apis?: Apis;
  config?: ConnectConfig;
  plugins: Plugins;
  rpcUrls?: { [key in Chain]?: string };
  stagenet?: boolean;
  wallets: Wallets;
}) {
  type PluginName = keyof Plugins;

  /**
   * @REMOVE (V1)
   * Compatibility layer for plugins and wallets for easier migration and backwards compatibility
   */
  const compatPlugins: Plugins = Array.isArray(plugins)
    ? plugins.reduce((acc, pluginInterface) => {
        // @ts-expect-error Ignore until we remove the compatibility layer
        const { name, plugin } = Object.values(pluginInterface)?.[0] || {};
        acc[name] = plugin;
        return acc;
      }, {})
    : plugins;
  const compatWallets: Wallets = Array.isArray(wallets)
    ? wallets.reduce((acc, wallet) => {
        // @ts-expect-error Ignore until we remove the compatibility layer
        const [walletName, connectWallet] = Object.entries(wallet)?.[0] || {};
        acc[walletName] = connectWallet;
        return acc;
      }, {})
    : wallets;

  const connectedWallets = {} as Wallet;
  const availablePlugins = Object.entries(compatPlugins).reduce(
    (acc, [pluginName, { plugin, config }]) => {
      const methods = plugin({ wallets: connectedWallets, stagenet, config });

      // @ts-expect-error
      acc[pluginName] = methods;
      return acc;
    },
    {} as { [key in PluginName]: ReturnType<Plugins[key]["plugin"]> },
  );

  const connectWalletMethods = Object.entries(compatWallets).reduce(
    (acc, [walletName, wallet]) => {
      const connectWallet = wallet({ addChain, config, apis, rpcUrls });

      // @ts-expect-error
      acc[walletName] = connectWallet;
      return acc;
    },
    {} as { [key in keyof Wallets]: ReturnType<Wallets[key]> },
  );

  /**
   * @Private
   */
  function getSwapKitPlugin<T extends PluginName>(pluginName: T) {
    const plugin = availablePlugins[pluginName] || Object.values(availablePlugins)[0];

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found", "Could not find the requested plugin");
    }

    return plugin;
  }

  function addChain<T extends Chain>(connectWallet: AddChainWalletParams<T>) {
    // @ts-expect-error: TODO
    connectedWallets[connectWallet.chain] = connectWallet;
  }

  function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress: spenderAddress,
  }: {
    type: T;
    assetValue: AssetValue;
    contractAddress: string;
  }) {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const walletMethods = connectedWallets[chain] as BaseEVMWallet;
    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;
    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    const from = getAddress(chain);
    if (!(address && from)) {
      throw new SwapKitError("core_approve_asset_address_or_from_not_found");
    }

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    }) as ApproveReturnType<T>;
  }

  /**
   * @Public
   */
  function getWallet<T extends Chain>(chain: T) {
    return connectedWallets[chain];
  }
  function getAddress<T extends Chain>(chain: T) {
    return getWallet(chain)?.address || "";
  }
  /**
   * TODO: Figure out validation without connecting to wallet
   */
  function validateAddress({ address, chain }: { address: string; chain: Chain }) {
    return getWallet(chain)?.validateAddress?.(address);
  }

  function getBalance<T extends Chain>(chain: T, refresh?: boolean) {
    if (refresh) {
      return getWalletWithBalance(chain).then((wallet) => wallet.balance);
    }

    return getWallet(chain)?.balance || [];
  }

  async function getWalletWithBalance<T extends Chain>(chain: T, potentialScamFilter = true) {
    const defaultBalance = [AssetValue.fromChainOrSignature(chain)];
    const wallet = getWallet(chain);

    if (!wallet) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    if ("getBalance" in wallet) {
      const balance = await wallet.getBalance(wallet.address, potentialScamFilter);
      wallet.balance = balance?.length ? balance : defaultBalance;
    }

    return wallet;
  }

  function approveAssetValue(assetValue: AssetValue, contractAddress: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  function swap<T extends PluginName>({ pluginName, ...rest }: SwapParams<T>) {
    const plugin = getSwapKitPlugin(pluginName);

    if ("swap" in plugin) {
      return plugin.swap(rest);
    }

    throw new SwapKitError("core_plugin_swap_not_found");
  }

  return {
    ...availablePlugins,
    ...connectWalletMethods,

    approveAssetValue,
    getAddress,
    getBalance,
    getExplorerAddressUrl: getAddressUrl,
    getExplorerTxUrl: getTxUrl,
    getWallet,
    getWalletWithBalance,
    isAssetValueApproved,
    swap,
    validateAddress,
  };
}
