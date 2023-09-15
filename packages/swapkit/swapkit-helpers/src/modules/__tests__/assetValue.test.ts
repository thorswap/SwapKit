import { BaseDecimal, Chain } from '@thorswap-lib/types';
import { describe, expect, test } from 'vitest';

import { AssetValue } from '../assetValue.ts';

describe('AssetValue', () => {
  describe('assetValue', () => {
    test('returns asset ticker with value', () => {
      const fakeAvaxUSDCAsset = new AssetValue({
        decimal: 6,
        value: 1234567890,
        chain: Chain.Avalanche,
        symbol: 'USDC-01234',
      });
      expect(fakeAvaxUSDCAsset.assetValue).toBe('1234567890 USDC');

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor.assetValue).toBe('0 THOR');

      const ethSynth = new AssetValue({
        chain: Chain.Ethereum,
        symbol: 'ETH/ETH',
        decimal: 18,
        value: 1234567890,
      });
      expect(ethSynth.assetValue).toBe('1234567890 ETH');
    });
  });

  describe('eq', () => {
    test('checks if assets are same chain and symbol', () => {
      const firstThor = AssetValue.fromChainOrSignature('ETH.THOR');
      const secondThor = AssetValue.fromChainOrSignature('ETH.THOR');
      const vThor = AssetValue.fromChainOrSignature('ETH.vTHOR');
      const firstUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: 'USDC-01234',
        decimal: 6,
        value: 1234567890,
      });
      const secondUsdc = new AssetValue({
        chain: Chain.Avalanche,
        symbol: 'USDC-01234',
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
        symbol: 'USDC-01234',
      });
      expect(fakeAvaxUSDCAsset.toString()).toBe('AVAX.USDC-01234');

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor.toString()).toBe('ETH.THOR-0xa5f2211B9b8170F694421f2046281775E8468044');

      const ethSynth = await AssetValue.fromIdentifier('ETH/ETH');
      expect(ethSynth.toString()).toBe('ETH/ETH');
    });
  });

  describe('fromIdentifier', () => {
    // TODO: Add more test cases for different decimals fetched from getDecimal
    test('creates AssetValue from string', async () => {
      const fakeAvaxUSDCAssetString = 'AVAX.USDC-0x1234567890';
      const fakeAvaxUSDCAsset = await AssetValue.fromIdentifier(fakeAvaxUSDCAssetString);

      expect(fakeAvaxUSDCAsset).toEqual(
        expect.objectContaining({
          address: '0x1234567890',
          chain: Chain.Avalanche,
          decimal: 6,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'USDC-0x1234567890',
          ticker: 'USDC',
        }),
      );
    });
  });

  describe('fromIdentifierSync', () => {
    test.todo('creates AssetValue from string via `@thorswap-lib/tokens` lists', () => {});
  });

  describe('fromChainOrSignature', () => {
    test('creates AssetValue from common asset string or chain', () => {
      const customBaseAsset = [Chain.Cosmos, Chain.BinanceSmartChain, Chain.THORChain];
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
          decimal: BaseDecimal[Chain.Cosmos],
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
          decimal: BaseDecimal[Chain.BinanceSmartChain],
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
          decimal: BaseDecimal[Chain.THORChain],
          isGasAsset: true,
          isSynthetic: false,
          symbol: 'RUNE',
          ticker: 'RUNE',
          type: 'Native',
        }),
      );

      const thor = AssetValue.fromChainOrSignature('ETH.THOR');
      expect(thor).toEqual(
        expect.objectContaining({
          address: '0xa5f2211B9b8170F694421f2046281775E8468044',
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'THOR-0xa5f2211B9b8170F694421f2046281775E8468044',
          ticker: 'THOR',
        }),
      );

      const vthor = AssetValue.fromChainOrSignature('ETH.vTHOR');
      expect(vthor).toEqual(
        expect.objectContaining({
          address: '0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D',
          chain: Chain.Ethereum,
          decimal: 18,
          isGasAsset: false,
          isSynthetic: false,
          symbol: 'vTHOR-0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D',
          ticker: 'vTHOR',
        }),
      );
    });
  });

  describe('loadStaticAssets', () => {
    test('loads static assets from `@thorswap-lib/tokens` lists', async () => {
      // Dummy test - think of sth more meaningful
      const { ok } = await AssetValue.loadStaticAssets();
      expect(ok).toBe(true);
    });
  });
});
