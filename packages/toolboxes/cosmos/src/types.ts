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
  assetValue: AssetValue;
  fee?: StdFee;
  feeOptionKey?: FeeOption;
  from: string;
  memo?: string;
  privkey?: Uint8Array;
  recipient: string;
  signer?: OfflineDirectSigner;
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
