import { type AssetValue, SwapKitError } from "@swapkit/helpers";
import { assetIdentifierToChainflipTicker } from "./broker";

export const toCFTicker = (asset: AssetValue) => {
  const ticker = assetIdentifierToChainflipTicker.get(asset.toString().toUpperCase());

  if (!ticker) {
    throw new SwapKitError("chainflip_unknown_asset");
  }

  return ticker;
};
