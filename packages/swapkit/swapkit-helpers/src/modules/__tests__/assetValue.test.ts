import { Chain } from '@thorswap-lib/types';
import { describe, expect, test } from 'vitest';

import { AssetValue } from '../assetValue.ts';

describe('AssetValue', () => {
  describe('fromString', () => {
    test('creates AssetValue from string', () => {
      const ethAsset = AssetValue.fromString(Chain.Ethereum);

      expect(ethAsset).toMatchObject({
        address: undefined,
        chain: Chain.Ethereum,
        decimal: 18,
        isGasAsset: true,
        isSynthetic: false,
        symbol: 'ETH',
        ticker: 'ETH',
        value: 0,
        bigIntValue: 0n,
      });
    });
  });

  describe('fromIdentifier', async () => {
    const fakeAvaxUSDCAssetString = 'AVAX.USDC-0x1234567890';
    const fakeAvaxUSDCAsset = await AssetValue.fromIdentifier(fakeAvaxUSDCAssetString);

    expect(fakeAvaxUSDCAsset).toMatchObject({
      address: '0x1234567890',
      chain: Chain.Avalanche,
      decimal: 6,
      isGasAsset: false,
      isSynthetic: false,
      symbol: 'USDC-0x1234567890',
      ticker: 'USDC',
      value: 0,
      bigIntValue: 0n,
    });
  });
});
