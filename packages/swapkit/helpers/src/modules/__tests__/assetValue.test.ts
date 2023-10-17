import { BaseDecimal, Chain } from '@swapkit/types';
import { describe, expect, test } from 'vitest';

import { AssetValue } from '../assetValue.ts';

describe('AssetValue', () => {
  describe('assetValue', () => {
    test('returns asset ticker with value', () => {
      const fakeAvaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: 'USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      });
      expect(fakeAvaxUSDCAsset.assetValue).toBe('1234567890 USDC');

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor.assetValue).toBe('0 THOR');

      const ethSynth = new AssetValue({
        chain: Chain.THORChain,
        symbol: 'ETH/ETH',
        decimal: 18,
        value: 1234567890,
      });
      expect(ethSynth.assetValue).toBe('1234567890 ETH/ETH');
      expect(ethSynth.toString()).toBe('THOR.ETH/ETH');
    });
  });

  describe('eq', () => {
    test('checks if assets are same chain and symbol', () => {
      const firstThor = AssetValue.fromChainOrSignature('ETH.THOR');
      const secondThor = AssetValue.fromChainOrSignature('ETH.THOR');
      const vThor = AssetValue.fromChainOrSignature('ETH.vTHOR');
      const firstUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: 'USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        decimal: 6,
        value: 1234567890,
      });
      const secondUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: 'USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
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

  describe('toString', () => {
    test('returns asset value string/identifier', async () => {
      const fakeAvaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: 'USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      });
      expect(fakeAvaxUSDCAsset.toString()).toBe(
        'AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
      );

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor.toString()).toBe('ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044');

      const ethSynth = await AssetValue.fromIdentifier('ETH/ETH');
      expect(ethSynth.toString()).toBe('THOR.ETH/ETH');
    });
  });

  describe('fromIdentifier', () => {
    test('creates AssetValue from string', async () => {
      const fakeAvaxUSDCAssetString = 'AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e';
      const fakeAvaxUSDCAsset = await AssetValue.fromIdentifier(fakeAvaxUSDCAssetString);

      expect(fakeAvaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
          chain: Chain.Avalanche,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
          ticker: 'USDC',
        }),
      );
    });
  });

  describe('fromString', () => {
    test('creates AssetValue from string', () => {
      test('creates AssetValue from string', async () => {
        const fakeAvaxAssetString = 'AVAX.ASDF-1234';
        const fakeAvaxAsset = await AssetValue.fromString(fakeAvaxAssetString);

        expect(fakeAvaxAsset).toEqual(
          expect.objectContaining({
            address: '1234',
            chain: Chain.Avalanche,
            decimal: 10,
            isGasAsset: false,
            isSynthetic: false,
            symbol: 'ASDF-1234',
            ticker: 'ASDF',
          }),
        );
      });
    });
  });

  describe('fromIdentifierSync', () => {
    test('(same as fromIdentifier) - creates AssetValue from string via `@swapkit/tokens` lists', async () => {
      await AssetValue.loadStaticAssets();
      const thor = AssetValue.fromIdentifierSync(
        'ARB.USDT-0XFD086BC7CD5C481DCC9C85EBE478A1C0B69FCBB9',
      );

      expect(thor).toBeDefined();
      expect(thor).toEqual(
        expect.objectContaining({
          address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
          chain: Chain.Arbitrum,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'USDT-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
          ticker: 'USDT',
        }),
      );
    });
  });

  describe('fromStringSync', () => {
    test('creates AssetValue from string via `@swapkit/tokens` lists', async () => {
      await AssetValue.loadStaticAssets();
      const thor = AssetValue.fromStringSync('ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044');

      expect(thor).toBeDefined();
      expect(thor).toEqual(
        expect.objectContaining({
          address: '0xa5f2211b9b8170f694421f2046281775e8468044',
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'THOR-0xa5f2211b9b8170f694421f2046281775e8468044',
          ticker: 'THOR',
        }),
      );
    });

    test('returns undefined if string is not in `@swapkit/tokens` lists', async () => {
      await AssetValue.loadStaticAssets();
      const fakeAvaxUSDCAssetString = 'AVAX.USDC-1234';
      const fakeAvaxUSDCAsset = AssetValue.fromStringSync(fakeAvaxUSDCAssetString);

      expect(fakeAvaxUSDCAsset).toBeUndefined();
    });
  });

  describe('fromChainOrSignature', () => {
    test('creates AssetValue from common asset string or chain', () => {
      const customBaseAsset = [Chain.Cosmos, Chain.BinanceSmartChain, Chain.THORChain, Chain.Maya];
      Object.values(Chain)
        .filter((c) => !customBaseAsset.includes(c))
        .forEach((chain) => {
          const asset = AssetValue.fromChainOrSignature(chain);
          expect(asset).toEqual(
            expect.objectContaining({
              address: undefined,
              chain,
              decimal: BaseDecimal[chain],
              isGasAsset: ![Chain.Arbitrum, Chain.Optimism].includes(chain),
              isSynthetic: false,
              symbol: chain,
              ticker: chain,
              type: 'Native',
            }),
          );
        });

      const cosmosAsset = AssetValue.fromChainOrSignature(Chain.Cosmos);
      expect(cosmosAsset).toEqual(
        expect.objectContaining({
          address: undefined,
          chain: Chain.Cosmos,
          decimal: BaseDecimal.GAIA,
          isGasAsset: true,
          isSynthetic: false,
          symbol: 'ATOM',
          ticker: 'ATOM',
          type: 'Native',
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
          symbol: 'BNB',
          ticker: 'BNB',
          type: 'Native',
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
          symbol: 'RUNE',
          ticker: 'RUNE',
          type: 'Native',
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
          symbol: 'CACAO',
          ticker: 'CACAO',
          type: 'Native',
        }),
      );

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor).toEqual(
        expect.objectContaining({
          address: '0xa5f2211b9b8170f694421f2046281775e8468044',
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'THOR-0xa5f2211b9b8170f694421f2046281775e8468044',
          ticker: 'THOR',
        }),
      );

      const vthor = AssetValue.fromChainOrSignature('ETH.vTHOR');
      expect(vthor).toEqual(
        expect.objectContaining({
          address: '0x815c23eca83261b6ec689b60cc4a58b54bc24d8d',
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'vTHOR-0x815c23eca83261b6ec689b60cc4a58b54bc24d8d',
          ticker: 'vTHOR',
        }),
      );
    });
  });

  describe('loadStaticAssets', () => {
    test('loads static assets from `@swapkit/tokens` lists', async () => {
      // Dummy test - think of sth more meaningful
      const { ok } = await AssetValue.loadStaticAssets();
      expect(ok).toBe(true);
    });
  });
});
