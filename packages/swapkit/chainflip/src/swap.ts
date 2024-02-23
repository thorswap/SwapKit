import type {
  Chain,
  ChainWallet,
  SwapKitProvider,
  SwapParams,
  SwapWithRouteParams,
} from "@swapkit/core";
import { AssetValue, SwapKitError, SwapKitNumber } from "@swapkit/helpers";

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

export const confirmSwap = async (
  quoteId: string,
): Promise<{ channelId: string; channelAddress: string; chain: string }> => {
  try {
    const response = await fetch("https://tbd.thorswap.io/channel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteId,
      }),
    }).then((res) => res.json());

    return response;
  } catch (error) {
    throw new SwapKitError("chainflip_channel_error", error);
  }
};

export const ChainflipProvider: SwapKitProvider = ({ wallets }) => {
  const swap = async (params: SwapParams) => {
    if (!("route" in params && "quoteId" in params)) {
      throw new SwapKitError("core_swap_invalid_params");
    }

    const {
      route: {
        calldata: { fromAsset, amountIn },
      },
      quoteId,
    } = params as SwapWithRouteParams;
    if (!fromAsset) throw new SwapKitError("core_swap_asset_not_recognized");
    const asset = await AssetValue.fromString(fromAsset);
    if (!wallets?.[asset.chain]) throw new SwapKitError("core_wallet_connection_not_found");
    const assetValue = asset.add(SwapKitNumber.fromBigInt(BigInt(amountIn), asset.decimal));

    const channelInfo = await confirmSwap(quoteId || "");

    return (wallets[asset.chain] as ChainWallet<Chain>).transfer({
      assetValue,
      recipient: channelInfo.channelAddress,
    });
  };
  return {
    name: "chainflip",
    methods: {
      swap,
    },
  };
};
