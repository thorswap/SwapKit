import { Chain } from '@thorswap-lib/types';
import { describe, expect, it } from 'vitest';

import { getNetworkName } from '../network.js';

describe('getNetworkName', () => {
  const casesWithExpectation: [Chain, string][] = [
    [Chain.Bitcoin, 'Bitcoin'],
    [Chain.Doge, 'Dogecoin'],
    [Chain.Litecoin, 'Litecoin'],
    [Chain.BitcoinCash, 'Bitcoin Cash'],
  ];

  casesWithExpectation.forEach(([chain, expected]) => {
    it(`returns ${expected} for chain ${chain}`, () => {
      const result = getNetworkName(chain, '');
      expect(result).toBe(expected);
    });
  });

  it('returns Ethereum as network name for ETH', () => {
    const result = getNetworkName(Chain.Ethereum, 'ETH');
    expect(result).toBe('Ethereum');
  });

  it('returns ticker as network name for non-ETH Ethereum tokens', () => {
    const result = getNetworkName(Chain.Ethereum, 'USDT');
    expect(result).toBe('USDT');
  });
});
