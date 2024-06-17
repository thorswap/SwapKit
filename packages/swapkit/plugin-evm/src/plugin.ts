import {
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  type EVMChain,
  EVMChains,
  ProviderName,
  SwapKitError,
  type SwapParams,
  type Wallet,
} from "@swapkit/helpers";
import type { EVMWallets } from "@swapkit/toolbox-evm";

import { lowercasedContractAbiMapping } from "./contracts";

type ChainWallets = Wallet<EVMWallets>;

type ApproveParams = {
  assetValue: AssetValue;
  spenderAddress: string;
};

const plugin = ({
  wallets,
}: {
  wallets: ChainWallets;
  config: { brokerEndpoint: string };
}) => {
  async function swap({ route, feeOptionKey }: SwapParams<"evm">) {
    const { evmTransactionDetails } = route;

    const assetValue = await AssetValue.fromString(route.sellAsset, route.sellAmount);

    const evmChain = assetValue.chain;
    const abi =
      evmTransactionDetails && lowercasedContractAbiMapping[evmTransactionDetails.contractAddress];

    if (!(EVMChains.includes(evmChain as EVMChain) && abi))
      throw new SwapKitError("core_swap_invalid_params");

    const wallet = wallets[assetValue.chain as EVMChain];
    const from = wallet.address;

    const tx = await wallet.call({
      contractAddress: evmTransactionDetails.contractAddress,
      funcName: evmTransactionDetails.contractMethod,
      funcParams: evmTransactionDetails.contractParams,
      txOverrides: {
        from,
      },
      feeOption: feeOptionKey,
      abi,
    });

    return tx as string;
  }

  /**
   * @Private
   * Wallet interaction helpers
   */
  function approve<T extends ApproveMode>({
    assetValue,
    spenderAddress,
    type = "checkOnly" as T,
  }: { type: T; spenderAddress: string; assetValue: AssetValue }) {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = EVMChains.includes(chain as EVMChain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const walletMethods = wallets[chain as EVMChain];

    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;
    if (!walletAction) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const from = walletMethods?.address;

    if (!(address && from)) {
      throw new SwapKitError("core_approve_asset_address_or_from_not_found");
    }

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    });
  }

  function approveAssetValue(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.CheckOnly });
  }

  return {
    swap,
    approveAssetValue,
    isAssetValueApproved,
    supportedSwapkitProviders: [
      ProviderName.TRADERJOE_V1,
      ProviderName.PANGOLIN_V1,
      ProviderName.UNISWAP_V2,
      ProviderName.SUSHISWAP_V2,
      ProviderName.ONEINCH,
      ProviderName.WOOFI_V2,
      ProviderName.PANCAKESWAP,
    ],
  };
};

export const EVMPlugin = { evm: { plugin } } as const;
