import type { QuoteResponseRoute } from "@swapkit/api";
import { lowercasedContractAbiMapping } from "@swapkit/helpers";
import {
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  type EVMChain,
  EVMChains,
  ProviderName,
  SwapKitError,
  type SwapKitPluginParams,
  type SwapParams,
} from "@swapkit/helpers";

type ApproveParams = {
  assetValue: AssetValue;
  spenderAddress: string;
};

function plugin({ getWallet }: SwapKitPluginParams) {
  async function swap({ route, feeOptionKey }: SwapParams<"evm", QuoteResponseRoute>) {
    const { evmTransactionDetails, sellAmount, sellAsset } = route;

    const abi =
      evmTransactionDetails && lowercasedContractAbiMapping[evmTransactionDetails.contractAddress];

    const assetValue = await AssetValue.from({
      asset: sellAsset,
      value: sellAmount,
      asyncTokenLookup: true,
    });

    const evmChain = assetValue.chain as EVMChain;

    if (!(EVMChains.includes(evmChain) && abi)) throw new SwapKitError("core_swap_invalid_params");

    const wallet = getWallet(evmChain);

    return wallet.call<string>({
      contractAddress: evmTransactionDetails.contractAddress,
      funcName: evmTransactionDetails.contractMethod,
      funcParams: evmTransactionDetails.contractParams,
      txOverrides: { from: wallet.address },
      feeOption: feeOptionKey,
      abi,
    });
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

    const wallet = getWallet(chain as EVMChain);

    if (!wallet) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const walletAction = type === "checkOnly" ? wallet.isApproved : wallet.approve;
    const from = wallet.address;

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
}

export const EVMPlugin = { evm: { plugin } } as const;
