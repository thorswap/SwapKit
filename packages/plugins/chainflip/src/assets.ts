import { type AssetValue, SwapKitError, type TokenNames } from "@swapkit/helpers";

class CaseInsensitiveMap<T, U> extends Map<T, U> {
  set(key: T, value: U): this {
    if (typeof key === "string") {
      // biome-ignore lint/style/noParameterAssign: quick helper
      key = key.toLowerCase() as unknown as T;
    }
    return super.set(key, value);
  }

  get(key: T): U | undefined {
    if (typeof key === "string") {
      // biome-ignore lint/style/noParameterAssign: quick helper
      key = key.toLowerCase() as unknown as T;
    }

    return super.get(key);
  }

  has(key: T): boolean {
    if (typeof key === "string") {
      // biome-ignore lint/style/noParameterAssign: quick helper
      key = key.toLowerCase() as unknown as T;
    }

    return super.has(key);
  }
}

export const cfTickers = new CaseInsensitiveMap<TokenNames, string>([
  ["ARB.ETH", "ArbEth"],
  ["ARB.USDC-0xaf88d065e77c8cC2239327C5EDb3A432268e5831", "ArbUsdc"],
  ["BTC.BTC", "Btc"],
  ["DOT.DOT", "Dot"],
  ["ETH.ETH", "Eth"],
  ["ETH.FLIP-0x826180541412D574cf1336d22c0C0a287822678A", "Flip"],
  ["ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "Usdc"],
  ["ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7", "Usdt"],
]);

export const toCFTicker = (asset: AssetValue) => {
  const ticker = cfTickers.get(asset.toString() as TokenNames);

  if (!ticker) {
    throw new SwapKitError("chainflip_unknown_asset");
  }

  return ticker;
};
