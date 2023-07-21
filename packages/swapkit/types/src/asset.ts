import { Chain } from './network.js';

export enum AssetSymbol {
  THOR = 'THOR',
  RUNE = 'RUNE',
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
