import { describe, expect, test } from "bun:test";

import { BaseDecimal, Chain } from "../../types/chains.ts";
import { AssetValue, getMinAmountByChain } from "../assetValue.ts";

describe("AssetValue", () => {
  describe("assetValue", () => {
    test("returns asset ticker with value", () => {
      const fakeAvaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      });
      expect(fakeAvaxUSDCAsset.toString()).toBe(
        "AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      );

      const ethSynth = new AssetValue({
        chain: Chain.THORChain,
        symbol: "ETH/ETH",
        decimal: 8,
        value: 1234567890,
      });

      expect(ethSynth.toString()).toBe("ETH/ETH");
      expect(ethSynth.mul(21.37).getValue("string")).toBe("26382715809.3");

      const ethThorSynth = new AssetValue({
        chain: Chain.THORChain,
        symbol: "ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044",
        decimal: 8,
        value: 1234567890,
      });
      expect(ethThorSynth.toString()).toBe("ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044");

      const atomDerived = new AssetValue({
        identifier: "THOR.ATOM",
        decimal: 6,
        value: 123456789,
      });

      expect(atomDerived.toString()).toBe("THOR.ATOM");
    });
  });

  describe("toUrl", () => {
    test("returns asset compliance with url", () => {
      const fakeAvaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      });
      expect(fakeAvaxUSDCAsset.toUrl()).toBe(
        "AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      );

      const thor = AssetValue.fromChainOrSignature("ETH.THOR");
      expect(thor.toUrl()).toBe("ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044");

      const ethSynth = new AssetValue({
        chain: Chain.THORChain,
        symbol: "ETH/ETH",
        decimal: 8,
        value: 1234567890,
      });
      expect(ethSynth.toUrl()).toBe("THOR.ETH.ETH");

      const ethThorSynth = new AssetValue({
        chain: Chain.THORChain,
        symbol: "ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044",
        decimal: 8,
        value: 1234567890,
      });
      expect(ethThorSynth.toUrl()).toBe("THOR.ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044");
    });
  });

  describe("eq", () => {
    test("checks if assets are same chain and symbol", () => {
      const firstThor = AssetValue.fromChainOrSignature("ETH.THOR");
      const secondThor = AssetValue.fromChainOrSignature("ETH.THOR");
      const vThor = AssetValue.fromChainOrSignature("ETH.vTHOR");
      const firstUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        decimal: 6,
        value: 1234567890,
      });
      const secondUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
        decimal: 6,
        value: 1234,
      });

      expect(firstThor.eq(firstThor)).toBe(true);
      expect(firstThor.eq(secondThor)).toBe(true);
      expect(firstThor.eq(vThor)).toBe(false);
      expect(firstThor.eq(firstUsdc)).toBe(false);
      expect(firstThor.eq(secondUsdc)).toBe(false);

      expect(firstUsdc.eq(firstThor)).toBe(false);
      expect(firstUsdc.eq(secondThor)).toBe(false);
      expect(firstUsdc.eq(vThor)).toBe(false);
      expect(firstUsdc.eq(firstUsdc)).toBe(true);
      expect(firstUsdc.eq(secondUsdc)).toBe(true);
    });
  });

  describe("from bigint", () => {
    test("returns asset value with correct decimal", async () => {
      const avaxUSDCAsset = await AssetValue.fromIdentifier(
        `${Chain.Avalanche}.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e`,
        1234567800n,
      );
      expect(avaxUSDCAsset.getValue("string")).toBe("1234.5678");
    });
  });

  describe("toString", () => {
    test("returns asset value string/identifier", async () => {
      const avaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      });
      expect(avaxUSDCAsset.toString()).toBe("AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e");

      const thor = AssetValue.fromChainOrSignature("ETH.THOR");
      expect(thor.toString()).toBe("ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044");

      const ethSynth = await AssetValue.fromIdentifier("ETH/ETH");
      expect(ethSynth.toString()).toBe("ETH/ETH");
    });
  });

  describe("fromIdentifier", () => {
    test("creates AssetValue from string", async () => {
      const avaxUSDCAsset = await AssetValue.fromIdentifier(
        "AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      );

      expect(avaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
          chain: Chain.Avalanche,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
          ticker: "USDC",
        }),
      );
    });
    test("creates AssetValue from string with multiple dashes", async () => {
      const ethPendleLptAsset = await AssetValue.fromIdentifier("ETH.PENDLE-LPT-0x1234");

      expect(ethPendleLptAsset).toEqual(
        expect.objectContaining({
          address: "0x1234",
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "PENDLE-LPT-0x1234",
          ticker: "PENDLE-LPT",
        }),
      );
    });
  });

  describe("fromString", () => {
    test("creates AssetValue from string", async () => {
      const fakeAvaxAssetString = "AVAX.ASDF-1234";
      const fakeAvaxAsset = await AssetValue.fromString(fakeAvaxAssetString);

      expect(fakeAvaxAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "ASDF-1234",
          ticker: "ASDF",
        }),
      );
    });
    test("creates AssetValue from string with multiple dashes", async () => {
      const fakeAvaxAssetString = "AVAX.ASDF-LP-1234";
      const fakeAvaxAsset = await AssetValue.fromString(fakeAvaxAssetString);

      expect(fakeAvaxAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "ASDF-LP-1234",
          ticker: "ASDF-LP",
        }),
      );
    });
  });

  describe("fromStringWithBase", () => {
    test("creates AssetValue from string with base", async () => {
      const fakeAvaxAssetString = "AVAX.ASDF-1234";
      const fakeAvaxAsset = await AssetValue.fromStringWithBase(fakeAvaxAssetString, 1, 8);

      expect(fakeAvaxAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "ASDF-1234",
          ticker: "ASDF",
        }),
      );
      expect(fakeAvaxAsset.getValue("string")).toBe("100000000");
      expect(fakeAvaxAsset.getBaseValue("string")).toBe("100000000000000000000000000");
    });
  });

  describe("fromUrl", () => {
    test("creates AssetValue from url like format", async () => {
      const synthETHString = "THOR.ETH.ETH";
      const ethString = "ETH.ETH";
      const thorString = "ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044";
      const synthThorString = "THOR.ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044";
      const synthDashesString = "THOR.ETH.PENDLE-LPT-0x1234";

      const synthETH = await AssetValue.fromUrl(synthETHString);
      const eth = await AssetValue.fromUrl(ethString);
      const thor = await AssetValue.fromUrl(thorString);
      const synthThor = await AssetValue.fromUrl(synthThorString);
      const synthDashes = await AssetValue.fromUrl(synthDashesString);

      expect(synthETH.toString()).toBe("ETH/ETH");
      expect(eth.toString()).toBe("ETH.ETH");
      expect(thor.toString()).toBe("ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044");
      expect(synthThor.toString()).toBe("ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044");
      expect(synthDashes.toString()).toBe("ETH/PENDLE-LPT-0x1234");
    });
  });

  describe("fromIdentifierSync", () => {
    test("(same as fromIdentifier) - creates AssetValue from string via `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const thor = AssetValue.fromIdentifierSync(
        "ARB.USDT-0XFD086BC7CD5C481DCC9C85EBE478A1C0B69FCBB9",
      );

      expect(thor).toBeDefined();
      expect(thor).toEqual(
        expect.objectContaining({
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
          chain: Chain.Arbitrum,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDT-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
          ticker: "USDT",
        }),
      );
    });
  });

  describe("fromStringSync", () => {
    test("creates AssetValue from string via `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const thor = AssetValue.fromStringSync("ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044");

      expect(thor).toBeDefined();
      expect(thor).toEqual(
        expect.objectContaining({
          address: "0xa5f2211b9b8170f694421f2046281775e8468044",
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "THOR-0xa5f2211b9b8170f694421f2046281775e8468044",
          ticker: "THOR",
        }),
      );

      const usdc = AssetValue.fromStringSync("ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48");
      expect(usdc).toBeDefined();
      expect(usdc).toEqual(
        expect.objectContaining({
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          chain: Chain.Ethereum,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          ticker: "USDC",
        }),
      );
    });

    test("returns safe decimals if string is not in `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const fakeAvaxUSDCAssetString = "AVAX.USDC-1234";
      const fakeAvaxUSDCAsset = AssetValue.fromStringSync(fakeAvaxUSDCAssetString);

      expect(fakeAvaxUSDCAsset).toBeDefined();
      expect(fakeAvaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-1234",
          ticker: "USDC",
        }),
      );
    });

    test("returns safe decimals if string is not in `@swapkit/tokens` lists with multiple dashes", async () => {
      await AssetValue.loadStaticAssets();
      const fakeAvaxUSDCAssetString = "AVAX.USDC-LPT-1234";
      const fakeAvaxUSDCAsset = AssetValue.fromStringSync(fakeAvaxUSDCAssetString);

      expect(fakeAvaxUSDCAsset).toBeDefined();
      expect(fakeAvaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-LPT-1234",
          ticker: "USDC-LPT",
        }),
      );
    });

    test("returns proper avax string with address from `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const avaxBTCb = "AVAX.BTC.b-0x152b9d0fdc40c096757f570a51e494bd4b943e50";
      const AvaxBTCb = AssetValue.fromStringSync(avaxBTCb);

      expect(AvaxBTCb).toBeDefined();
      expect(AvaxBTCb).toEqual(
        expect.objectContaining({
          address: "0x152b9d0fdc40c096757f570a51e494bd4b943e50",
          chain: Chain.Avalanche,
          decimal: 8,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "BTC.b-0x152b9d0fdc40c096757f570a51e494bd4b943e50",
          ticker: "BTC.b",
        }),
      );
    });
  });

  describe("fromStringWithBaseSync", () => {
    test("creates AssetValue from string with base decimals via `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const btc = AssetValue.fromStringWithBaseSync("BTC.BTC", 5200000000000, 8);

      expect(btc).toBeDefined();
      expect(btc).toEqual(
        expect.objectContaining({
          chain: Chain.Bitcoin,
          decimal: 8,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "BTC",
          ticker: "BTC",
        }),
      );

      expect(btc.getValue("string")).toBe("52000");
      expect(btc.getBaseValue("string")).toBe("5200000000000");
    });

    test("returns safe decimals if string is not in `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const fakeAvaxUSDCAssetString = "AVAX.USDC-1234";
      const fakeAvaxUSDCAsset = AssetValue.fromStringWithBaseSync(fakeAvaxUSDCAssetString, 1, 8);

      expect(fakeAvaxUSDCAsset).toBeDefined();
      expect(fakeAvaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: "1234",
          chain: Chain.Avalanche,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-1234",
          ticker: "USDC",
        }),
      );

      expect(fakeAvaxUSDCAsset.getValue("string")).toBe("0.00000001");
      expect(fakeAvaxUSDCAsset.getBaseValue("string")).toBe("10000000000");
    });

    test("returns proper avax string with address from `@swapkit/tokens` lists", async () => {
      await AssetValue.loadStaticAssets();
      const avaxUSDC = "AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e";
      const AvaxUSDC = AssetValue.fromStringWithBaseSync(avaxUSDC, 100000000, 8);

      expect(AvaxUSDC).toBeDefined();
      expect(AvaxUSDC).toEqual(
        expect.objectContaining({
          address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
          chain: Chain.Avalanche,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
          ticker: "USDC",
        }),
      );

      expect(AvaxUSDC.getValue("string")).toBe("1");
      expect(AvaxUSDC.getBaseValue("string")).toBe("1000000");
    });
  });

  describe("fromChainOrSignature", () => {
    test("creates AssetValue from common asset string or chain", () => {
      const customBaseAsset = [
        Chain.Cosmos,
        Chain.BinanceSmartChain,
        Chain.THORChain,
        Chain.Maya,
        Chain.Arbitrum,
        Chain.Optimism,
      ];
      const filteredChains = Object.values(Chain).filter((c) => !customBaseAsset.includes(c));

      for (const chain of filteredChains) {
        const asset = AssetValue.fromChainOrSignature(chain);
        expect(asset).toEqual(
          expect.objectContaining({
            address: undefined,
            chain,
            decimal: BaseDecimal[chain],
            isGasAsset: true,
            isSynthetic: false,
            symbol: chain,
            ticker: chain,
            type: "Native",
          }),
        );
      }

      const cosmosAsset = AssetValue.fromChainOrSignature(Chain.Cosmos);
      expect(cosmosAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.Cosmos,
          decimal: BaseDecimal.GAIA,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "ATOM",
          ticker: "ATOM",
          type: "Native",
        }),
      );

      const bscAsset = AssetValue.fromChainOrSignature(Chain.BinanceSmartChain);
      expect(bscAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.BinanceSmartChain,
          decimal: BaseDecimal.BSC,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "BNB",
          ticker: "BNB",
          type: "Native",
        }),
      );

      const thorAsset = AssetValue.fromChainOrSignature(Chain.THORChain);
      expect(thorAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.THORChain,
          decimal: BaseDecimal.THOR,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "RUNE",
          ticker: "RUNE",
          type: "Native",
        }),
      );

      const cacaoAsset = AssetValue.fromChainOrSignature(Chain.Maya);
      expect(cacaoAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.Maya,
          decimal: BaseDecimal.MAYA,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "CACAO",
          ticker: "CACAO",
          type: "Native",
        }),
      );

      const thor = AssetValue.fromChainOrSignature("ETH.THOR");
      expect(thor).toEqual(
        expect.objectContaining({
          address: "0xa5f2211b9b8170f694421f2046281775e8468044",
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "THOR-0xa5f2211b9b8170f694421f2046281775e8468044",
          ticker: "THOR",
        }),
      );

      const vthor = AssetValue.fromChainOrSignature("ETH.vTHOR");
      expect(vthor).toEqual(
        expect.objectContaining({
          address: "0x815c23eca83261b6ec689b60cc4a58b54bc24d8d",
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: "vTHOR-0x815c23eca83261b6ec689b60cc4a58b54bc24d8d",
          ticker: "vTHOR",
        }),
      );

      const arbAsset = AssetValue.fromChainOrSignature(Chain.Arbitrum);
      expect(arbAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.Arbitrum,
          decimal: BaseDecimal.ARB,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "ETH",
          ticker: "ETH",
          type: "Native",
        }),
      );

      const opAsset = AssetValue.fromChainOrSignature(Chain.Optimism);
      expect(opAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.Optimism,
          decimal: BaseDecimal.OP,
          isGasAsset: true,
          isSynthetic: false,
          symbol: "ETH",
          ticker: "ETH",
          type: "Native",
        }),
      );
    });
  });

  describe("loadStaticAssets", () => {
    test("loads static assets from `@swapkit/tokens` lists", async () => {
      // Dummy test - think of sth more meaningful
      const { ok } = await AssetValue.loadStaticAssets();
      expect(ok).toBe(true);
    });
  });
});

describe("getMinAmountByChain", () => {
  test("returns min amount for chain", () => {
    expect(getMinAmountByChain(Chain.THORChain).getValue("string")).toBe("0");
    expect(getMinAmountByChain(Chain.Maya).getValue("string")).toBe("0");
    expect(getMinAmountByChain(Chain.Cosmos).getValue("string")).toBe("0.000001");

    expect(getMinAmountByChain(Chain.Bitcoin).getValue("string")).toBe("0.00010001");
    expect(getMinAmountByChain(Chain.Litecoin).getValue("string")).toBe("0.00010001");
    expect(getMinAmountByChain(Chain.BitcoinCash).getValue("string")).toBe("0.00010001");
    expect(getMinAmountByChain(Chain.Dogecoin).getValue("string")).toBe("1.00000001");

    expect(getMinAmountByChain(Chain.BinanceSmartChain).getValue("string")).toBe("0.00000001");
    expect(getMinAmountByChain(Chain.Ethereum).getValue("string")).toBe("0.00000001");
    expect(getMinAmountByChain(Chain.Avalanche).getValue("string")).toBe("0.00000001");
    expect(getMinAmountByChain(Chain.Arbitrum).getValue("string")).toBe("0.00000001");
    expect(getMinAmountByChain(Chain.Optimism).getValue("string")).toBe("0.00000001");
  });
});
