import type { QuoteRouteV2 } from "@swapkit/api";
import { AssetValue, type BaseWallet, SwapKitError, type SwapParams } from "@swapkit/helpers";

export async function confirmSwap({
  buyAsset,
  sellAsset,
  recipient,
  brokerEndpoint,
}: {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
  brokerEndpoint: string;
}) {
  try {
    const response = await fetch(brokerEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyAsset: buyAsset.toString(),
        sellAsset: sellAsset.toString(),
        destinationAddress: recipient,
      }),
    }).then((res) => res.json());

    return response as { channelId: string; depositAddress: string; chain: string };
  } catch (error) {
    throw new SwapKitError("chainflip_channel_error", error);
  }
}

const plugin = ({
  wallets,
  config: { brokerEndpoint },
}: { wallets: BaseWallet<{ [key: string]: NotWorth }>; config: { brokerEndpoint: string } }) => {
  async function swap({ recipient, ...rest }: SwapParams<"chainflip">) {
    if (!("route" in rest && (rest.route as QuoteRouteV2)?.buyAsset && brokerEndpoint)) {
      throw new SwapKitError("core_swap_invalid_params");
    }

    const { buyAsset: buyString, sellAsset: sellString, sellAmount } = rest.route as QuoteRouteV2;
    if (!(sellString && buyString)) {
      throw new SwapKitError("core_swap_asset_not_recognized");
    }

    const sellAsset = await AssetValue.fromString(sellString);
    if (!wallets?.[sellAsset.chain]) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const buyAsset = await AssetValue.fromString(buyString);
    const assetValue = sellAsset.set(sellAmount);

    const { depositAddress } = await confirmSwap({
      brokerEndpoint,
      buyAsset,
      recipient,
      sellAsset,
    });

    const tx = await wallets[sellAsset.chain].transfer({
      assetValue,
      from: wallets[sellAsset.chain]?.address,
      recipient: depositAddress,
    });

    return tx as string;
  }

  return { swap };
};

export const ChainflipPlugin = { chainflip: { plugin } } as const;

/**
 * @deprecated Use import { ChainflipPlugin } from "@swapkit/chainflip" instead
 */
export const ChainflipProvider = ChainflipPlugin;
