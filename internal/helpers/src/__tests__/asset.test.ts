import { describe, it, expect } from 'vitest';
import { assetFromString, assetToString } from '../asset.js';
import { Chain } from '@thorswap-lib/types';

describe('assetToString', () => {
  it('should return the correct string representation of an asset', () => {
    const asset = { chain: Chain.Ethereum, symbol: 'USDT' };
    expect(assetToString(asset)).toBe('ETH.USDT');

    const synthAsset = { chain: Chain.THORChain, symbol: 'BNB/BNB' };
    expect(assetToString(synthAsset)).toBe('THOR.BNB/BNB');
  });
});

describe('assetFromString', () => {
  it('should return the correct asset object from a string', () => {
    const assetString = 'ETH.USDT';
    const expectedAsset = { chain: Chain.Ethereum, symbol: 'USDT', ticker: 'USDT', synth: false };
    expect(assetFromString(assetString)).toEqual(expectedAsset);
  });

  it('should return the correct asset object from a synth string', () => {
    const assetString = 'THOR.BNB/BNB';
    const expectedAsset = { chain: Chain.THORChain, symbol: 'BNB/BNB', ticker: 'BNB/BNB', synth: true };
    expect(assetFromString(assetString)).toEqual(expectedAsset);
  });

  it('should return the correct asset object from a string with a hyphen', () => {
    const assetString = 'ETH.USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306';
    const expectedAsset = { chain: Chain.Ethereum, symbol: 'USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306', ticker: 'USDT', synth: false };
    expect(assetFromString(assetString)).toEqual(expectedAsset);
  });
});
