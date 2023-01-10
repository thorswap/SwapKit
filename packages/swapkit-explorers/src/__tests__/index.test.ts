import { Chain } from '@thorswap-lib/types';
import { describe, test } from 'vitest';

import { getExplorerAddressUrl, getExplorerTxUrl } from '../index.js';

describe('Avalanche', () => {
  test('getExplorerTxUrl returns correct URL for Avalanche', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Avalanche, txID: '12345' })).toBe(
      'https://snowtrace.io/tx/12345',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Avalanche', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Avalanche, address: 'abcde' })).toBe(
      'https://snowtrace.io/address/abcde',
    );
  });
});

describe('Binance Smart Chain', () => {
  test('getExplorerTxUrl returns correct URL for Binance Smart Chain', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.BinanceSmartChain, txID: '67890' })).toBe(
      'https://bscscan.com/tx/67890',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Binance Smart Chain', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.BinanceSmartChain, address: 'fghij' })).toBe(
      'https://bscscan.com/address/fghij',
    );
  });
});

describe('Binance', () => {
  test('getExplorerTxUrl returns correct URL for Binance', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Binance, txID: 'abcde' })).toBe(
      'https://explorer.binance.org/tx/abcde',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Binance', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Binance, address: 'klmno' })).toBe(
      'https://explorer.binance.org/address/klmno',
    );
  });
});

describe('Bitcoin Cash', () => {
  test('getExplorerTxUrl returns correct URL for Bitcoin Cash', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.BitcoinCash, txID: 'fghij' })).toBe(
      'https://www.blockchain.com/bch/tx/fghij',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Bitcoin Cash', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.BitcoinCash, address: 'pqrst' })).toBe(
      'https://www.blockchain.com/bch/address/pqrst',
    );
  });
});

describe('Bitcoin', () => {
  test('getExplorerTxUrl returns correct URL for Bitcoin', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Bitcoin, txID: 'klmno' })).toBe(
      'https://blockstream.info/tx/klmno',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Bitcoin', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Bitcoin, address: 'uvwxy' })).toBe(
      'https://blockstream.info/address/uvwxy',
    );
  });
});

describe('Cosmos', () => {
  test('getExplorerTxUrl returns correct URL for Cosmos', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Cosmos, txID: 'pqrst' })).toBe(
      'https://cosmos.bigdipper.live/transactions/pqrst',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Cosmos', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Cosmos, address: 'zabcd' })).toBe(
      'https://cosmos.bigdipper.live/account/zabcd',
    );
  });
});

describe('Doge', () => {
  test('getExplorerTxUrl returns correct URL for Doge', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Doge, txID: 'uvwxy' })).toBe(
      'https://blockchair.com/dogecoin/transaction/uvwxy',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Doge', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Doge, address: 'efghi' })).toBe(
      'https://blockchair.com/dogecoin/address/efghi',
    );
  });
});

describe('Litecoin', () => {
  test('getExplorerTxUrl returns correct URL for Litecoin', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Litecoin, txID: 'efghi' })).toBe(
      'https://ltc.bitaps.com/efghi',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Litecoin', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Litecoin, address: '12345' })).toBe(
      'https://ltc.bitaps.com/12345',
    );
  });
});

describe('Ethereum', () => {
  test('getExplorerTxUrl returns correct URL for Ethereum', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.Ethereum, txID: 'zabcd' })).toBe(
      'https://etherscan.io/tx/zabcd',
    );
  });

  test('getExplorerAddressUrl returns correct URL for Ethereum', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.Ethereum, address: '12345' })).toBe(
      'https://etherscan.io/address/12345',
    );
  });
});

describe('THORChain', () => {
  test('getExplorerTxUrl returns correct URL for THORChain', ({ expect }) => {
    expect(getExplorerTxUrl({ chain: Chain.THORChain, txID: 'efghi' })).toBe(
      'https://viewblock.io/thorchain/tx/efghi',
    );
  });

  test('getExplorerAddressUrl returns correct URL for THORChain', ({ expect }) => {
    expect(getExplorerAddressUrl({ chain: Chain.THORChain, address: '67890' })).toBe(
      'https://viewblock.io/thorchain/address/67890',
    );
  });
});
