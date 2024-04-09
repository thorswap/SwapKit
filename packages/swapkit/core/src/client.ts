import {
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  type BaseWallet,
  Chain,
  SwapKitError,
  type SwapKitPluginInterface,
  type SwapParams,
} from "@swapkit/helpers";
import type { CosmosWallets, ThorchainWallets } from "@swapkit/toolbox-cosmos";
import type { BaseEVMWallet, EVMWallets } from "@swapkit/toolbox-evm";
import type { SubstrateWallets } from "@swapkit/toolbox-substrate";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";
import {
  getExplorerAddressUrl as getAddressUrl,
  getExplorerTxUrl as getTxUrl,
} from "./helpers/explorerUrls.ts";
import type { ConnectWalletParamsLocal as ConnectWalletParams } from "./types.ts";

export type Wallet = BaseWallet<
  EVMWallets & CosmosWallets & ThorchainWallets & UTXOWallets & SubstrateWallets
>;

export type SwapKitWallet<ConnectMethod extends string, ConnectParams extends {}> = {
  connectMethodName: ConnectMethod;
  connect: (
    params: ConnectWalletParams,
  ) => (connectParams: ConnectParams) => boolean | Promise<boolean>;
};

export function SwapKit<
  Plugins extends SwapKitPluginInterface<string, {}, {}>[],
  SupportedWallets extends SwapKitWallet<string, {}>[],
>({
  stagenet,
  wallets,
  plugins,
  config = {},
  apis = {},
  rpcUrls = {},
}: {
  plugins: Plugins;
  stagenet: boolean;
  wallets: SupportedWallets;
  config?: Record<string, Todo>;
  apis: Record<string, Todo>;
  rpcUrls: Record<string, Todo>;
}) {
  type PluginsReturn = ReturnType<Plugins[number]>;
  type AvailablePlugins = { [key in PluginsReturn["name"]]: PluginsReturn };

  const connectedWallets = {} as Wallet;
  const availablePlugins = {} as AvailablePlugins;

  for (const plugin of plugins) {
    const { name, methods } = plugin({ wallets: connectedWallets, stagenet });

    // @ts-expect-error That is only resolved to any whenever there are no plugins
    availablePlugins[name] = methods;
  }

  const connectWalletMethods = wallets.reduce(
    (acc, wallet) => {
      acc[wallet.connectMethodName] = wallet.connect({ addChain, config, apis, rpcUrls });

      return acc;
    },
    {} as Record<string, Todo>,
  );

  /**
   * @Private
   * Internal helpers
   */
  function getSwapKitPlugin<T extends keyof AvailablePlugins>(pluginName: T) {
    const plugin = availablePlugins[pluginName] || Object.values(availablePlugins)[0];

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found", "Could not find the requested plugin");
    }

    return plugin;
  }

  function addChain<T extends Chain>(connectWallet: Wallet[T]) {
    // @ts-expect-error: TODO
    connectedWallets[connectWallet.chain] = connectWallet;
  }

  /**
   * @Private
   * Wallet interaction helpers
   */
  function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress: spenderAddress,
  }: {
    type: T;
    assetValue: AssetValue;
    contractAddress: string;
  }): ApproveReturnType<T> {
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
   * Wallet helpers
   */
  function getWallet<T extends Chain>(chain: T) {
    return connectedWallets[chain];
  }
  function getAddress(chain: Chain) {
    return getWallet(chain)?.address || "";
  }
  async function getBalance(chain: Chain, refresh?: boolean) {
    if (refresh) {
      const wallet = await getWalletWithBalance(chain, true);
      return wallet.balance || [];
    }

    return getWallet(chain)?.balance || [];
  }
  /**
   * TODO: Figure out validation without connecting to wallet
   */
  function validateAddress({ address, chain }: { address: string; chain: Chain }) {
    return getWallet(chain)?.validateAddress?.(address);
  }

  async function getWalletWithBalance(chain: Chain, potentialScamFilter = true) {
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

  /**
   * @Public
   * Wallet interaction methods
   */
  function approveAssetValue(assetValue: AssetValue, contractAddress: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  function swap({ provider, pluginConfig, ...rest }: SwapParams<keyof AvailablePlugins>) {
    const passedPluginConfig = pluginConfig || provider;

    if (!passedPluginConfig) {
      throw new SwapKitError("core_plugin_not_found");
    }

    const plugin = getSwapKitPlugin(passedPluginConfig?.name);

    // @ts-expect-error Technically this should be a valid call...
    return plugin.swap({ provider, ...rest });
  }

  return {
    ...availablePlugins,
    ...connectWalletMethods,

    getExplorerAddressUrl: getAddressUrl,
    getExplorerTxUrl: getTxUrl,

    approveAssetValue,
    getAddress,
    getBalance,
    getWallet,
    getWalletWithBalance,
    isAssetValueApproved,
    swap,
    validateAddress,
  };
}
