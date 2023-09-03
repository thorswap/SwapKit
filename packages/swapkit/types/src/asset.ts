import type { Chain } from './network.ts';

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
