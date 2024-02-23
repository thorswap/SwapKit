import { AssetValue, SwapKitError } from "@swapkit/helpers";
import { Chain } from "@swapkit/types";
import type {
  ChainWallet,
  ConnectWalletParamsLocal as ConnectWalletParams,
  SwapWithRouteParams,
} from "../types.ts";

type ProviderName = "thorchain" | "chainflip" | "mayachain";

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

type ProviderMethods = {
  swap: (swapParams: SwapParams) => Promise<string>;
  [key: string]: any;
};

export type SwapKitProvider = ({
  wallets,
  stagenet,
}: {
  wallets: Wallets;
  stagenet?: boolean;
}) => {
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

export function SwapKit({
  stagenet,
  wallets,
  providers,
  config,
  apis,
  rpcUrls,
}: {
  providers: SwapKitProvider[];
  stagenet: boolean;
  wallets: SwapKitWallet[];
  config?: Record<string, any>;
  apis: Record<string, any>;
  rpcUrls: Record<string, any>;
}): SwapKitReturnType {
  const _wallets: Wallets = {};
  const _providers: SwapKitProviders = {};

  for (const provider of providers) {
    const instance = provider({ wallets: _wallets, stagenet });
    _providers[instance.name] = instance.methods;
  }

  function getAddress(chain: Chain) {
    return _wallets[chain]?.address || "";
  }

  function getBalance(chain: Chain) {
    const wallet = getWallet(chain);

    return wallet?.balance || [];
  }

  function getWallet(chain: Chain) {
    return _wallets[chain];
  }

  const getWalletWithBalance = async (chain: Chain, potentialScamFilter?: boolean) => {
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
  };

  const approveAssetValue = (assetValue: AssetValue, contractAddress: string) =>
    approve({ assetValue, type: "approve", contractAddress });

  const isAssetValueApproved = (assetValue: AssetValue, contractAddress: string) =>
    approve<boolean>({ assetValue, contractAddress, type: "checkOnly" });

  const validateAddress = ({ address, chain }: { address: string; chain: Chain }) =>
    getWallet(chain)?.validateAddress?.(address);

  const approve = <T = string>({
    assetValue,
    type = "checkOnly",
    contractAddress,
  }: {
    assetValue: AssetValue;
    type?: "checkOnly" | "approve";
    contractAddress: string;
  }) => {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) return true;

    const walletMethods =
      _wallets[chain as Chain.Ethereum | Chain.BinanceSmartChain | Chain.Avalanche];

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
    }) as Promise<T>;
  };

  const swap = (params: SwapParams) => {
    const provider = params.provider
      ? _providers[params.provider.name]
      : Object.values(_providers).length
        ? Object.values(_providers).length === 0
          ? Object.values(_providers)[0]
          : undefined
        : undefined;
    if (!provider) {
      throw new SwapKitError(
        "core_swap_provider_not_found",
        "Could not find the requested provider",
      );
    }
    return provider.swap(params);
  };

  const addChain = (connectWallet: ChainWallet<Chain>) => {
    _wallets[connectWallet.chain] = connectWallet as any;
  };

  return {
    getAddress,
    getWallet,
    getWalletWithBalance,
    getBalance,
    swap,
    validateAddress,
    approveAssetValue,
    isAssetValueApproved,
    ..._providers,
    ...wallets.reduce(
      (acc, wallet) => {
        acc[wallet.connectMethodName] = wallet.connect({
          addChain,
          config: config || {},
          apis,
          rpcUrls,
        });

        return acc;
      },
      {} as Record<string, ReturnType<SwapKitWallet["connect"]>>,
    ),
  };
}
