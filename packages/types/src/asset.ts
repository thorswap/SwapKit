import { Chain } from './network.js';

export enum AssetSymbol {
  THOR = 'THOR',
  RUNE = 'RUNE',
  'RUNE-67C' = 'RUNE-67C',
  'RUNE-B1A' = 'RUNE-B1A',
  ATOM = 'ATOM',
  MUON = 'MUON',
  USDC = 'USDC',
}

export type Asset = {
  chain: Chain;
  symbol: string;
  ticker: string;
  synth?: boolean;
};
