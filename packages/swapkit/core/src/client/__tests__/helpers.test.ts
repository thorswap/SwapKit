import { Chain, ChainToExplorerUrl } from '@swapkit/types';
import { describe, expect, test } from 'vitest';

import { getExplorerAddressUrl, getExplorerTxUrl } from '../explorerUrls.ts';

describe('Explorer URLs', () => {
  [
    Chain.Binance,
    Chain.Bitcoin,
    Chain.BitcoinCash,
    Chain.Maya,
    Chain.Kujira,
    Chain.THORChain,
  ].forEach((chain) => {
    test(`getExplorerTxUrl returns correct URL for ${chain}`, () => {
      expect(getExplorerTxUrl({ chain, txHash: '0x123456789' })).toBe(
        `${ChainToExplorerUrl[chain]}/tx/123456789`,
      );

      expect(getExplorerAddressUrl({ chain, address: 'asdfg' })).toBe(
        `${ChainToExplorerUrl[chain]}/address/asdfg`,
      );
    });
  });

  [
    Chain.Arbitrum,
    Chain.Avalanche,
    Chain.BinanceSmartChain,
    Chain.Ethereum,
    Chain.Optimism,
    Chain.Polygon,
  ].forEach((chain) => {
    test(`getExplorerTxUrl returns correct URL for ${chain}`, () => {
      expect(getExplorerTxUrl({ chain, txHash: '0x123456789' })).toBe(
        `${ChainToExplorerUrl[chain]}/tx/0x123456789`,
      );

      expect(getExplorerAddressUrl({ chain, address: 'asdfg' })).toBe(
        `${ChainToExplorerUrl[chain]}/address/asdfg`,
      );
    });
  });

  test('getExplorerTxUrl throws Error for unsupported Chain', () => {
    expect(() =>
      getExplorerTxUrl({ chain: 'unsupported' as Chain, txHash: '0x12345' }),
    ).toThrowError('Unsupported chain: unsupported');
  });
  test('getExplorerAddressUrl throws Error for unsupported Chain', () => {
    expect(() =>
      getExplorerAddressUrl({ chain: 'unsupported' as Chain, address: 'asdfg' }),
    ).toThrowError('Unsupported chain: unsupported');
  });
  test('getExplorerTxUrl adds 0x for EVM like chains', () => {
    expect(getExplorerTxUrl({ chain: Chain.Ethereum, txHash: '12345' })).toBe(
      'https://etherscan.io/tx/0x12345',
    );
  });

  test('getExplorerTxUrl returns correct URL for Litecoin', () => {
    expect(getExplorerTxUrl({ chain: Chain.Litecoin, txHash: 'efghi' })).toBe(
      'https://ltc.bitaps.com/efghi',
    );
  });
  test('getExplorerAddressUrl returns correct URL for Litecoin', () => {
    expect(getExplorerAddressUrl({ chain: Chain.Litecoin, address: '12345' })).toBe(
      'https://ltc.bitaps.com/12345',
    );
  });

  test('getExplorerTxUrl returns correct URL for Cosmos', () => {
    expect(getExplorerTxUrl({ chain: Chain.Cosmos, txHash: 'pqrst' })).toBe(
      'https://cosmos.bigdipper.live/transactions/pqrst',
    );
  });
  test('getExplorerAddressUrl returns correct URL for Cosmos', () => {
    expect(getExplorerAddressUrl({ chain: Chain.Cosmos, address: 'zabcd' })).toBe(
      'https://cosmos.bigdipper.live/account/zabcd',
    );
  });

  test('getExplorerTxUrl returns correct URL for Doge', () => {
    expect(getExplorerTxUrl({ chain: Chain.Dogecoin, txHash: 'uvwxy' })).toBe(
      'https://blockchair.com/dogecoin/transaction/uvwxy',
    );
  });
  test('getExplorerAddressUrl returns correct URL for Doge', () => {
    expect(getExplorerAddressUrl({ chain: Chain.Dogecoin, address: 'efghi' })).toBe(
      'https://blockchair.com/dogecoin/address/efghi',
    );
  });
});
