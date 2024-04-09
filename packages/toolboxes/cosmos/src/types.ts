import type { StdFee } from "@cosmjs/amino";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { AssetValue, ChainId, FeeOption } from "@swapkit/helpers";

import type {
  BinanceToolboxType,
  GaiaToolboxType,
  KujiraToolboxType,
  MayaToolboxType,
  ThorchainToolboxType,
} from "./index.ts";

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
  feeOptionKey?: FeeOption;
};

export type ToolboxParams = {
  server?: string;
  stagenet?: boolean;
};

export type Signer = {
  pubKey: string;
  signature: string;
};

export type CosmosLikeToolbox =
  | GaiaToolboxType
  | BinanceToolboxType
  | ThorchainToolboxType
  | MayaToolboxType
  | KujiraToolboxType;

export type CosmosMaxSendableAmountParams = {
  toolbox: CosmosLikeToolbox;
  from: string;
  asset?: AssetValue | string;
  feeOptionKey?: FeeOption;
};
