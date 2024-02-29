import type { Chain, ChainWallet, QuoteRouteV2, SwapParams } from "@swapkit/core";
import { AssetValue, SwapKitError } from "@swapkit/helpers";

export type ChainflipRoute = {
  sellAsset: string;
  buyAsset: string;
  provider: "chainflip";
  buyAmount: number;
  sellAmount: number;
};

export type ChainflipSwapParams = {
  quoteId: string;
  route: ChainflipRoute;
};

export const confirmSwap = async ({
  buyAsset,
  sellAsset,
  recipient,
  brokerEndpoint,
}: {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
  brokerEndpoint: string;
}): Promise<{ channelId: string; depositAddress: string; chain: string }> => {
  try {
    const response = await fetch(brokerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buyAsset: buyAsset.toString(),
        sellAsset: sellAsset.toString(),
        destinationAddress: recipient,
      }),
    }).then((res) => res.json());

    return response;
  } catch (error) {
    throw new SwapKitError("chainflip_channel_error", error);
  }
};

type Wallets = { [K in Chain]?: ChainWallet<K> };

export const ChainflipProvider = ({
  wallets,
}: {
  wallets: Wallets;
  stagenet?: boolean;
}) => {
  const swap = async (params: SwapParams) => {
    if (
      !(
        "route" in params &&
        (params.route as QuoteRouteV2).buyAsset &&
        params.provider?.config.brokerEndpoint
      )
    ) {
      throw new SwapKitError("core_swap_invalid_params");
    }

    const route: QuoteRouteV2 = params.route as QuoteRouteV2;

    const { buyAsset: buyAssetString, sellAsset: sellAssetString, sellAmount } = route;
    if (!(sellAssetString && buyAssetString))
      throw new SwapKitError("core_swap_asset_not_recognized");
    const sellAsset = await AssetValue.fromString(sellAssetString);
    const buyAsset = await AssetValue.fromString(buyAssetString);
    if (!wallets?.[sellAsset.chain]) throw new SwapKitError("core_wallet_connection_not_found");
    const assetValue = sellAsset.set(sellAmount);

    const channelInfo = await confirmSwap({
      buyAsset,
      sellAsset,
      recipient: params.recipient,
      brokerEndpoint: params.provider.config.brokerEndpoint,
    });

    return (wallets[sellAsset.chain] as ChainWallet<Chain>).transfer({
      assetValue,
      from: wallets[sellAsset.chain]?.address,
      recipient: channelInfo.depositAddress,
    });
  };
  return {
    name: "chainflip",
    methods: {
      swap,
    },
  };
};
