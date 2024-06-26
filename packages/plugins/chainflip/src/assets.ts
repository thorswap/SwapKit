import { type AssetValue, SwapKitError } from "@swapkit/helpers";

export const cfTickers = {
  "ARB.ETH": "ArbEth",
  "ARB.USDC-0XAF88D065E77C8CC2239327C5EDB3A432268E5831": "ArbUsdc",
  "BTC.BTC": "Btc",
  "DOT.DOT": "Dot",
  "ETH.ETH": "Eth",
  "ETH.FLIP-0X826180541412D574CF1336D22C0C0A287822678A": "Flip",
  "ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48": "Usdc",
  "ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7": "Usdt",
};

export const toCFTicker = (asset: AssetValue) => {
  const identifier = asset.toString().toUpperCase() as keyof typeof cfTickers;
  const ticker = cfTickers[identifier];

  if (!ticker) {
    throw new SwapKitError("chainflip_unknown_asset");
  }

  return ticker;
};
