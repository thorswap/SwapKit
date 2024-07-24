import {
  AssetValue,
  Chain,
  ProviderName,
  SwapKitError,
  type SwapKitPluginParams,
  type SwapParams,
} from "@swapkit/helpers";

function plugin({ getWallet }: SwapKitPluginParams) {
  async function swap({ route }: SwapParams<"radix">) {
    const { sellAmount, sellAsset } = route;

    const assetValue = await AssetValue.from({
      asset:
        sellAsset === "XRD.XRD"
          ? "XRD.XRD-resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd"
          : sellAsset,
      value: sellAmount,
      asyncTokenLookup: true,
    });

    if (Chain.Radix !== assetValue.chain) throw new SwapKitError("core_swap_invalid_params");

    const wallet = getWallet(assetValue.chain);

    return wallet.signAndBroadcast({
      manifest: route.transaction as string,
      //   message: `Swap ${sellAsset} to ${route.buyAsset}`,
      //   feeOptionKey,
    });
  }

  return {
    swap,
    supportedSwapkitProviders: [ProviderName.CAVIAR_V1],
  };
}

export const RadixPlugin = { radix: { plugin } } as const;
