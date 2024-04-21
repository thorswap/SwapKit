import { describe, expect, test } from "bun:test";
import { BaseDecimal, Chain } from "@swapkit/helpers";

import { assetFromString, getAssetType, getDecimal } from "../asset.ts";

const tickerMap: Record<string, string> = {
  [Chain.THORChain]: "RUNE",
  [Chain.Cosmos]: "ATOM",
  [Chain.BinanceSmartChain]: "BNB",
};

describe("getAssetType", () => {
  describe("when isSynth is true", () => {
    test('should return "Synth"', () => {
      const result = getAssetType({ chain: Chain.Bitcoin, symbol: "BTC/BTC" });
      expect(result).toBe("Synth");
    });
  });

  describe("when isSynth is false", () => {
    describe("for native chains and their assets", () => {
      for (const chain of Object.values(Chain)) {
        test(`should return "Native" for chain ${chain} asset`, () => {
          const ticker = tickerMap[chain] || chain;
          const result = getAssetType({ chain: chain as Chain, symbol: ticker });

          expect(result).toBe("Native");
        });
      }
    });

    describe("for Cosmos chain", () => {
      test('should return "GAIA" for non-ATOM tickers', () => {
        const result = getAssetType({ chain: Chain.Cosmos, symbol: "NOT_ATOM" });
        expect(result).toBe("GAIA");
      });
    });

    describe("for Binance chain", () => {
      test('should return "BEP2" for non-BNB tickers', () => {
        const result = getAssetType({ chain: Chain.Binance, symbol: "NOT_BNB" });
        expect(result).toBe("BEP2");
      });
    });

    describe("for Binance Smart Chain", () => {
      test('should return "BEP20" for non-BNB tickers', () => {
        const result = getAssetType({ chain: Chain.BinanceSmartChain, symbol: "NOT_BNB" });
        expect(result).toBe("BEP20");
      });
    });

    describe("for Ethereum chain", () => {
      test('should return "ERC20" for non-ETH tickers', () => {
        const result = getAssetType({ chain: Chain.Ethereum, symbol: "NOT_ETH" });
        expect(result).toBe("ERC20");
      });
    });

    describe("for Avalanche chain", () => {
      test('should return "AVAX" for non-AVAX tickers', () => {
        const result = getAssetType({ chain: Chain.Avalanche, symbol: "NOT_AVAX" });
        expect(result).toBe("AVAX");
      });
    });
  });
});

describe("getDecimal", () => {
  /**
   * Test out native
   */
  const filteredChains = Object.values(Chain).filter(
    (c) => ![Chain.Ethereum, Chain.Avalanche].includes(c),
  );

  for (const chain of filteredChains) {
    describe(chain, () => {
      test(
        `returns proper decimal for native ${chain} asset`,
        async () => {
          const decimal = await getDecimal({ chain, symbol: chain });
          expect(decimal).toBe(BaseDecimal[chain]);
        },
        { retry: 3 },
      );
    });
  }

  describe("ETH", () => {
    test(
      "returns proper decimal for eth and it's assets",
      async () => {
        const ethDecimal = await getDecimal({ chain: Chain.Ethereum, symbol: "ETH" });
        expect(ethDecimal).toBe(BaseDecimal.ETH);
        await Bun.sleep(500);

        const usdcDecimal = await getDecimal({
          chain: Chain.Ethereum,
          symbol: "USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        });
        expect(usdcDecimal).toBe(6);
        await Bun.sleep(500);

        const wbtcDecimal = await getDecimal({
          chain: Chain.Ethereum,
          symbol: "WBTC-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        });
        expect(wbtcDecimal).toBe(8);
        await Bun.sleep(500);

        const kindDecimal = await getDecimal({
          chain: Chain.Ethereum,
          symbol: "KIND-0x4618519de4c304f3444ffa7f812dddc2971cc688",
        });
        expect(kindDecimal).toBe(8);
        await Bun.sleep(500);

        const shitcoinDecimal = await getDecimal({
          chain: Chain.Ethereum,
          symbol: "HOMI-0xCa208BfD69ae6D2667f1FCbE681BAe12767c0078",
        });
        expect(shitcoinDecimal).toBe(0);
        await Bun.sleep(500);
      },
      { retry: 3 },
    );
  });

  describe("AVAX", () => {
    test(
      "returns proper decimal for avax and it's assets",
      async () => {
        const avaxDecimal = await getDecimal({ chain: Chain.Avalanche, symbol: "AVAX" });
        expect(avaxDecimal).toBe(BaseDecimal.AVAX);

        const wbtceDecimal = await getDecimal({
          chain: Chain.Avalanche,
          symbol: "WBTC.e-0x50b7545627a5162f82a992c33b87adc75187b218",
        });
        expect(wbtceDecimal).toBe(8);
        await Bun.sleep(500);

        const btcbDecimal = await getDecimal({
          chain: Chain.Avalanche,
          symbol: "BTC.b-0x152b9d0FdC40C096757F570A51E494bd4b943E50",
        });
        expect(btcbDecimal).toBe(8);
        await Bun.sleep(500);

        const timeDecimal = await getDecimal({
          chain: Chain.Avalanche,
          symbol: "TIME-0xb54f16fB19478766A268F172C9480f8da1a7c9C3",
        });
        expect(timeDecimal).toBe(9);
        await Bun.sleep(500);

        const usdtDecimal = await getDecimal({
          chain: Chain.Avalanche,
          symbol: "USDT-0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        });
        expect(usdtDecimal).toBe(6);
        await Bun.sleep(500);

        const usdcDecimal = await getDecimal({
          chain: Chain.Avalanche,
          symbol: "USDC-0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        });
        expect(usdcDecimal).toBe(6);
        await Bun.sleep(500);
      },
      { retry: 3 },
    );
  });
});

describe("assetFromString", () => {
  test("should return the correct object", () => {
    const assetString = "THOR.RUNE";
    const result = assetFromString(assetString);

    expect(result).toEqual({
      chain: Chain.THORChain,
      symbol: "RUNE",
      ticker: "RUNE",
      synth: false,
    });
  });

  test("should return the correct object for multiple dashes", () => {
    const assetString = "ETH.PENDLE-LPT-0x1234";
    const result = assetFromString(assetString);

    expect(result).toEqual({
      chain: Chain.Ethereum,
      symbol: "PENDLE-LPT-0x1234",
      ticker: "PENDLE-LPT",
      synth: false,
    });
  });
});
