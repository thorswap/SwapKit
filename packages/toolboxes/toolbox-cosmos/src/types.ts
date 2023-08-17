import { StdFee } from '@cosmjs/amino';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Chain, ChainId, FeeOption } from '@thorswap-lib/types';

import { BinanceToolboxType, GaiaToolboxType, ThorchainToolboxType } from './index.js';

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

export type CosmosLikeToolbox = GaiaToolboxType | BinanceToolboxType | ThorchainToolboxType;

export type CosmosMaxSendableAmountParams = {
  toolbox: CosmosLikeToolbox;
  from: string;
  asset?: AssetEntity | string;
  feeOptionKey?: FeeOption;
};
