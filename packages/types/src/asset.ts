import { Chain } from './network.js';

export enum AssetSymbol {
  AVAX = 'AVAX',
  BNB = 'BNB',
  BSC = 'BSC',
  BTC = 'BTC',
  ETH = 'ETH',
  THOR = 'THOR',
  GAIA = 'GAIA',
  BCH = 'BCH',
  LTC = 'LTC',
  RUNE = 'RUNE',
  'RUNE-67C' = 'RUNE-67C',
  'RUNE-B1A' = 'RUNE-B1A',
  DOGE = 'DOGE',
  ATOM = 'ATOM',
  MUON = 'MUON',
  USDC = 'USDC',
  RUNE_ERC_20 = 'RUNE-0x3155ba85d5f96b2d030a4966af206230e46849cb',
  RUNE_ERC_20_TESTNET = 'RUNE-0xd601c6A3a36721320573885A8d8420746dA3d7A0',
}

export type Asset = {
  chain: Chain;
  symbol: string;
  ticker: string;
  synth?: boolean;
};
