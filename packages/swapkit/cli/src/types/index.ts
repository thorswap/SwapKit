import { Chain } from '@coinmasters/core';

export type balanceData = {
  chain: string;
  symbol: string;
  address: string;
  balance: string;
};

export const CONNECTED_CHAINS = [
  //Chain.Arbitrum,
  Chain.Avalanche,
  //Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  //Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  //Chain.Kujira,
  Chain.Litecoin,
  //Chain.Maya,
  //Chain.Optimism,
  //Chain.Polygon,
  //Chain.THORChain,
];
