import { Chain, FeeOption } from '@swapkit/types';
import { networks } from 'bitcoinjs-lib';
import coininfo from 'coininfo';

const pid = typeof process !== 'undefined' && process.pid ? process.pid.toString(36) : '';

export const getNetwork = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return networks.bitcoin;
    case Chain.BitcoinCash:
      return coininfo.bitcoincash.main.toBitcoinJS();
    case Chain.Dogecoin:
      // eslint-disable-next-line no-case-declarations
      const bip32 = {
        private: 0x04358394,
        public: 0x043587cf,
      };
      // eslint-disable-next-line no-case-declarations
      const test = coininfo.dogecoin.test;
      test.versions.bip32 = bip32;
      return coininfo.dogecoin.main.toBitcoinJS();
    case Chain.Litecoin:
      return coininfo.litecoin.main.toBitcoinJS();
    default:
      throw new Error('Invalid chain');
  }
};

export const standardFeeRates = (rate: number) => ({
  [FeeOption.Average]: rate,
  [FeeOption.Fast]: rate * 1.5,
  [FeeOption.Fastest]: rate * 2.0,
});

let last = 0;
const now = () => {
  const time = Date.now();
  const lastTime = last || time;
  last = lastTime;

  return time > last ? time : lastTime + 1;
};

export const uniqid = () => pid + now().toString(36);
