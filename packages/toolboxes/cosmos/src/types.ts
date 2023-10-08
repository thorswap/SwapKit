import type { StdFee } from '@cosmjs/amino';
import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { AssetValue } from '@swapkit/helpers';
import type { ChainId, FeeOption } from '@swapkit/types';
import { Chain } from '@swapkit/types';

import type { BinanceToolboxType, GaiaToolboxType, ThorchainToolboxType } from './index.ts';

export type { MultisigThresholdPubkey } from '@cosmjs/amino';

export type CosmosSDKClientParams = {
  server: string;
  chainId: ChainId;
  prefix?: string;
  stagenet?: boolean;
};

export type TransferParams = {
  privkey?: Uint8Array;
  signer?: OfflineDirectSigner;
  from: string;
  recipient: string;
  assetValue: AssetValue;
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

export type Signer = {
  pubKey: string;
  signature: string;
};

export type CosmosLikeToolbox = GaiaToolboxType | BinanceToolboxType | ThorchainToolboxType;

export type CosmosMaxSendableAmountParams = {
  toolbox: CosmosLikeToolbox;
  from: string;
  asset?: AssetValue | string;
  feeOptionKey?: FeeOption;
};
