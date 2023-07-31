import { StdFee } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Chain, ChainId } from '@thorswap-lib/types';

export type CosmosSDKClientParams = {
  server: string;
  chainId: ChainId;
  prefix?: string;
};

export type TransferParams = {
  privkey?: Uint8Array;
  signer?: OfflineDirectSigner;
  from: string;
  to: string;
  amount: string;
  asset: string;
  memo?: string;
  fee?: StdFee;
};

export const AssetAtom = {
  chain: Chain.Cosmos,
  symbol: 'ATOM',
  ticker: 'ATOM',
  synth: false,
};
export const AssetMuon = {
  chain: Chain.Cosmos,
  symbol: 'MUON',
  ticker: 'MUON',
  synth: false,
};

export const AssetRuneNative = {
  chain: Chain.THORChain,
  symbol: 'RUNE',
  ticker: 'RUNE',
};
