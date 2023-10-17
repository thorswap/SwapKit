import type { StdFee } from '@cosmjs/amino';
import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { AssetValue } from '@swapkit/helpers';
import type { ChainId, FeeOption } from '@swapkit/types';

import type {
  BinanceToolboxType,
  GaiaToolboxType,
  MayaToolboxType,
  ThorchainToolboxType,
} from './index.ts';

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

export type Signer = {
  pubKey: string;
  signature: string;
};

export type CosmosLikeToolbox =
  | GaiaToolboxType
  | BinanceToolboxType
  | ThorchainToolboxType
  | MayaToolboxType;

export type CosmosMaxSendableAmountParams = {
  toolbox: CosmosLikeToolbox;
  from: string;
  asset?: AssetValue | string;
  feeOptionKey?: FeeOption;
};
