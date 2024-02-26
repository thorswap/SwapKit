import { AssetValue, SwapKitError } from "@swapkit/helpers";
import { Chain } from "@swapkit/types";
import type {
  ChainWallet,
  ConnectWalletParamsLocal as ConnectWalletParams,
  SwapWithRouteParams,
} from "../types.ts";

type ProviderName = "thorchain" | "chainflip" | "mayachain";
enum ApproveMode {
  Approve = "approve",
  CheckOnly = "checkOnly",
}

type ApproveReturnType<T extends ApproveMode> = T extends "checkOnly"
  ? Promise<boolean>
  : Promise<string>;

type SwapKitProviders = {
  [K in ProviderName]?: ProviderMethods;
};

type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};

export type SwapParams = (SwapWithRouteParams | GenericSwapParams) & {
  provider?: {
    name: ProviderName;
    config: Record<string, any>;
  };
};

type SwapKitReturnType = SwapKitProviders & {
  getAddress: (chain: Chain) => string;
  getWallet: (chain: Chain) => ChainWallet<Chain> | undefined;
  getWalletWithBalance: (
    chain: Chain,
    potentialScamFilter?: boolean,
  ) => Promise<ChainWallet<Chain>>;
  getBalance: (chain: Chain, potentialScamFilter?: boolean) => AssetValue[];
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

type Wallets = { [K in Chain]?: ChainWallet<K> };
type AvailableProviders<T> = T | { [K in ProviderName]?: ProviderMethods };
type ProviderMethods = {
  swap: (swapParams: SwapParams) => Promise<string>;
  [key: string]: any;
};

export type SwapKitProvider = ({ wallets, stagenet }: { wallets: Wallets; stagenet?: boolean }) => {
  name: ProviderName;
  methods: ProviderMethods;
};

type BaseSwapkitWalletConnectParams = {
  chains: Chain[];
};

type KeystoreWalletConnectParams = BaseSwapkitWalletConnectParams & {
  phrase: string;
  index?: number;
};

type WalletConnectParams = KeystoreWalletConnectParams;

type SwapKitWallet = {
  connectMethodName: string;
  connect: (params: ConnectWalletParams) => (connectParams: WalletConnectParams) => void;
};

export function SwapKit<
  ExtendedProviders extends {},
  ConnectWalletMethods extends Record<string, ReturnType<SwapKitWallet["connect"]>>,
>({
  stagenet,
  wallets,
  providers,
  config = {},
  apis,
  rpcUrls,
}: {
  providers: SwapKitProvider[];
  stagenet: boolean;
  wallets: SwapKitWallet[];
  config?: Record<string, any>;
  apis: Record<string, any>;
  rpcUrls: Record<string, any>;
}): SwapKitReturnType & ConnectWalletMethods {
  const connectedWallets: Wallets = {};
  const availableProviders: AvailableProviders<ExtendedProviders> = {};

  for (const provider of providers) {
    const { name, methods } = provider({ wallets: connectedWallets, stagenet });

    availableProviders[name] = methods;
  }

  const connectWalletMethods = wallets.reduce((acc, wallet) => {
    (acc[wallet.connectMethodName] as ReturnType<SwapKitWallet["connect"]>) = wallet.connect({
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
  function getProvider(providerName?: ProviderName) {
    const provider =
      (availableProviders as SwapKitProviders)[providerName as ProviderName] ||
      Object.values(availableProviders)[0];

    if (!provider) {
      throw new SwapKitError(
        "core_swap_provider_not_found",
        "Could not find the requested provider",
      );
    }

    return provider;
  }

  function addChain(connectWallet: ChainWallet<Chain>) {
    (connectedWallets[connectWallet.chain as Chain] as ChainWallet<Chain>) = connectWallet;
  }

  /**
   * @Private
   * Wallet interaction helpers
   */
  function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress,
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

    const walletMethods =
      connectedWallets[chain as Chain.Ethereum | Chain.BinanceSmartChain | Chain.Avalanche];

    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    const from = getAddress(chain);

    if (!(address && from)) throw new SwapKitError("core_approve_asset_address_or_from_not_found");

    const spenderAddress = contractAddress;

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
  function getBalance(chain: Chain) {
    return getWallet(chain)?.balance || [];
  }
  /**
   * TODO: Figure out validation without connecting to wallet
   */
  function validateAddress({ address, chain }: { address: string; chain: Chain }) {
    return getWallet(chain)?.validateAddress?.(address);
  }

  async function getWalletWithBalance(chain: Chain, potentialScamFilter?: boolean) {
    const defaultBalance = [AssetValue.fromChainOrSignature(chain)];
    const wallet = getWallet(chain);

    try {
      if (!wallet) throw new SwapKitError("core_wallet_connection_not_found");
      const balance = await wallet?.getBalance(wallet.address, potentialScamFilter);

      wallet.balance = balance?.length ? balance : defaultBalance;

      return wallet;
    } catch (error) {
      throw new SwapKitError("core_wallet_connection_not_found", error);
    }
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

  function swap({ provider: providerConfig, ...rest }: SwapParams) {
    const provider = getProvider(providerConfig?.name);

    return provider.swap({ provider: providerConfig, ...rest });
  }

  return {
    ...availableProviders,
    ...connectWalletMethods,
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
