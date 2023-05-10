import { proto } from '@cosmos-client/core';
import { Chain } from '@thorswap-lib/types';

export type CosmosSDKClientParams = {
  server: string;
  chainId: string;
  prefix?: string;
};

export type TransferParams = {
  privkey: proto.cosmos.crypto.secp256k1.PrivKey;
  from: string;
  to: string;
  amount: string;
  asset: string;
  memo?: string;
  fee?: proto.cosmos.tx.v1beta1.Fee;
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
