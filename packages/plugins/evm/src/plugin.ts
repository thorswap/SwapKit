import type { QuoteResponseRoute, QuoteResponseRouteDev } from "@swapkit/api";
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
  async function swap({
    route,
    feeOptionKey,
  }: SwapParams<"evm", QuoteResponseRoute | QuoteResponseRouteDev>) {
    const { sellAsset } = route;

    const tx = (route as QuoteResponseRouteDev).tx;
    const evmTransactionDetails = (route as QuoteResponseRoute).evmTransactionDetails;

    const assetValue = await AssetValue.from({
      asset: sellAsset,
      asyncTokenLookup: true,
    });

    const evmChain = assetValue.chain as EVMChain;
    const wallet = getWallet(evmChain);

    if (tx) {
      const { from, to, data } = tx;
      return wallet.sendTransaction({ from, to, data, value: BigInt(tx.value) }, feeOptionKey);
    }

    const abi =
      evmTransactionDetails && lowercasedContractAbiMapping[evmTransactionDetails.contractAddress];

    if (!(EVMChains.includes(evmChain) && abi)) throw new SwapKitError("core_swap_invalid_params");

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
      ProviderName.ONEINCH,
      ProviderName.PANCAKESWAP,
      ProviderName.PANGOLIN_V1,
      ProviderName.SUSHISWAP_V2,
      ProviderName.TRADERJOE_V2,
      ProviderName.UNISWAP_V2,
      ProviderName.UNISWAP_V3,
    ],
  };
}

export const EVMPlugin = { evm: { plugin } } as const;
