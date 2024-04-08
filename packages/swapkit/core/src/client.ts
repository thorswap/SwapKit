import {
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  type AvailableProviders,
  type BaseWallet,
  Chain,
  type ChainWallet,
  type PluginName,
  SwapKitError,
  type SwapKitPlugin,
  type SwapKitPlugins,
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

export type SwapKitReturnType = SwapKitPlugins & {
  getAddress: (chain: Chain) => string;
  getWallet: (chain: Chain) => ChainWallet | undefined;
  getWalletWithBalance: (chain: Chain, potentialScamFilter?: boolean) => Promise<ChainWallet>;
  getBalance: (chain: Chain, refresh?: boolean) => Promise<AssetValue[]>;
  getExplorerTxUrl: typeof getTxUrl;
  getExplorerAddressUrl: typeof getAddressUrl;
  swap: (params: SwapParams) => Promise<string>;
  validateAddress: (params: { address: string; chain: Chain }) =>
    | boolean
    | Promise<boolean>
    | undefined;
  approveAssetValue: (assetValue: AssetValue, contractAddress: string) => boolean | Promise<string>;
  isAssetValueApproved: (
    assetValue: AssetValue,
    contractAddress: string,
  ) => boolean | Promise<boolean>;
};

export type Wallet = BaseWallet<
  EVMWallets & CosmosWallets & ThorchainWallets & UTXOWallets & SubstrateWallets
>;

export type SwapKitWallet = {
  connectMethodName: string;
  connect: (params: ConnectWalletParams) => (connectParams: Todo) => undefined | string;
};

export function SwapKit<
  ExtendedProviders extends {},
  ConnectWalletMethods = Record<string, ReturnType<SwapKitWallet["connect"]>>,
>({
  stagenet,
  wallets,
  plugins,
  config = {},
  apis = {},
  rpcUrls = {},
}: {
  plugins: SwapKitPlugin[];
  stagenet: boolean;
  wallets: SwapKitWallet[];
  config?: Record<string, Todo>;
  apis: Record<string, Todo>;
  rpcUrls: Record<string, Todo>;
}) {
  const connectedWallets = {} as Wallet;
  const availablePlugins: AvailableProviders<ExtendedProviders> = {};

  for (const plugin of plugins) {
    const { name, methods } = plugin({ wallets: connectedWallets, stagenet });

    availablePlugins[name] = methods;
  }

  const connectWalletMethods = wallets.reduce((acc, wallet) => {
    // @ts-expect-error TODO
    acc[wallet.connectMethodName] = wallet.connect({
      // @ts-expect-error TODO
      addChain,
      config,
      apis,
      rpcUrls,
    });

    return acc;
  }, {} as ConnectWalletMethods);

  /**
   * @Private
   * Internal helpers
   */
  function getSwapKitPlugin(pluginName?: PluginName) {
    const plugin =
      (availablePlugins as SwapKitPlugins)[pluginName as PluginName] ||
      Object.values(availablePlugins)[0];

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found", "Could not find the requested plugin");
    }

    return plugin;
  }

  function addChain(connectWallet: Wallet[Chain]) {
    // @ts-expect-error TODO
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
  function getWallet(chain: Chain) {
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
    getWallet(chain)?.validateAddress?.(address);
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

  function swap({ provider, ...rest }: SwapParams) {
    const plugin = getSwapKitPlugin(provider?.name);

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

export type SwapKitClient<T extends {}, K> = ReturnType<typeof SwapKit<T, K>>;
