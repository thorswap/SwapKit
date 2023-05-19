import { Chain } from '@thorswap-lib/types';

export const getNetworkName = (chain: Chain, ticker: string) => {
  if (chain === Chain.Bitcoin) return 'Bitcoin';
  if (chain === Chain.Doge) return 'Dogecoin';
  if (chain === Chain.Litecoin) return 'Litecoin';
  if (chain === Chain.BitcoinCash) return 'Bitcoin Cash';

  if (chain === Chain.Ethereum && ticker === 'ETH') {
    return 'Ethereum';
  }

  return ticker;
};
