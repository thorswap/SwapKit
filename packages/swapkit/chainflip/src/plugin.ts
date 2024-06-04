import {
  AssetValue,
  type BaseWallet,
  type Chain,
  ProviderName,
  type QuoteResponseRoute,
  SwapKitError,
  type SwapParams,
} from "@swapkit/helpers";

import type { EVMWallets } from "@swapkit/toolbox-evm";
import type { SubstrateWallets } from "@swapkit/toolbox-substrate";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";

type Wallets = BaseWallet<EVMWallets & SubstrateWallets & UTXOWallets>;
type SupportedChain = Chain.Bitcoin | Chain.Ethereum | Chain.Polkadot;

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
}: { wallets: Wallets; config: { brokerEndpoint: string } }) => {
  async function swap(swapParams: SwapParams<"chainflip">) {
    if (
      !(
        "route" in swapParams &&
        (swapParams.route as QuoteResponseRoute)?.buyAsset &&
        brokerEndpoint
      )
    ) {
      throw new SwapKitError("core_swap_invalid_params", { ...swapParams, brokerEndpoint });
    }

    const {
      route: {
        buyAsset: buyString,
        sellAsset: sellString,
        sellAmount,
        destinationAddress: recipient,
      },
    } = swapParams;
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

    const tx = await wallets[sellAsset.chain as SupportedChain].transfer({
      assetValue,
      from: wallets[sellAsset.chain]?.address,
      recipient: depositAddress,
    });

    return tx as string;
  }

  return {
    swap,
    supportedSwapkitProviders: [ProviderName.CHAINFLIP],
  };
};

export const ChainflipPlugin = { chainflip: { plugin } } as const;

/**
 * @deprecated Use import { ChainflipPlugin } from "@swapkit/chainflip" instead
 */
export const ChainflipProvider = ChainflipPlugin;
