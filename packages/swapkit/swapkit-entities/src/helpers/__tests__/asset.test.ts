import { Chain } from '@thorswap-lib/types';
import { describe, expect, it } from 'vitest';

import { getAssetType } from '../asset.js';

const tickerMap: Record<string, string> = {
  [Chain.THORChain]: 'RUNE',
  [Chain.Cosmos]: 'ATOM',
  [Chain.BinanceSmartChain]: 'BNB',
};

describe('getAssetType', () => {
  describe('when isSynth is true', () => {
    it('should return "Synth"', () => {
      const result = getAssetType(Chain.Bitcoin, 'BTC', true);
      expect(result).toBe('Synth');
    });
  });

  describe('when isSynth is false', () => {
    describe('for native chains and their assets', () => {
      Object.values(Chain).forEach((chain) => {
        it(`should return "Native" for chain ${chain} asset`, () => {
          const ticker = tickerMap[chain] || chain;
          const result = getAssetType(chain as Chain, ticker);

          expect(result).toBe('Native');
        });
      });
    });

    describe('for Cosmos chain', () => {
      it('should return "GAIA" for non-ATOM tickers', () => {
        const result = getAssetType(Chain.Cosmos, 'NOT_ATOM');
        expect(result).toBe('GAIA');
      });
    });

    describe('for Binance chain', () => {
      it('should return "BEP2" for non-BNB tickers', () => {
        const result = getAssetType(Chain.Binance, 'NOT_BNB');
        expect(result).toBe('BEP2');
      });
    });

    describe('for Binance Smart Chain', () => {
      it('should return "BEP20" for non-BNB tickers', () => {
        const result = getAssetType(Chain.BinanceSmartChain, 'NOT_BNB');
        expect(result).toBe('BEP20');
      });
    });

    describe('for Ethereum chain', () => {
      it('should return "ERC20" for non-ETH tickers', () => {
        const result = getAssetType(Chain.Ethereum, 'NOT_ETH');
        expect(result).toBe('ERC20');
      });
    });

    describe('for Avalanche chain', () => {
      it('should return "AVAX" for non-AVAX tickers', () => {
        const result = getAssetType(Chain.Avalanche, 'NOT_AVAX');
        expect(result).toBe('AVAX');
      });
    });

    describe('for unknown chains', () => {
      it('should return the chain name as a fallback', () => {
        const unknownChain = 'UnknownChain' as unknown as Chain;
        const result = getAssetType(unknownChain, 'UNK');
        expect(result).toBe(unknownChain);
      });
    });
  });
});
