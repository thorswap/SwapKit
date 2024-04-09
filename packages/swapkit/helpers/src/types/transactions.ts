import type { AssetValue } from "../modules/assetValue";

export enum FeeOption {
  Average = "average",
  Fast = "fast",
  Fastest = "fastest",
}

export enum ApproveMode {
  Approve = "approve",
  CheckOnly = "checkOnly",
}

export type ApproveReturnType<T extends ApproveMode> = T extends "checkOnly"
  ? Promise<boolean>
  : Promise<string>;

export type WalletTxParams = {
  feeOptionKey?: FeeOption;
  from?: string;
  memo?: string; // optional memo to pass
  recipient: string;
};

export type EVMTxBaseParams<T = bigint> = {
  to?: string;
  from?: string;
  nonce?: number;
  gasLimit?: T;
  data?: string;
  value?: T;
  chainId?: T;
};

export type GetAddressAndPubKeyResponse = {
  bech32_address: string;
  compressed_pk: NotWorth;
  error_message: string;
  return_code: number;
};

export type Signature = {
  pub_key: {
    type: string;
    value: string;
  };
  sequence: string;
  signature: string;
};

export enum MemoType {
  BOND = "BOND",
  DEPOSIT = "+",
  LEAVE = "LEAVE",
  THORNAME_REGISTER = "~",
  UNBOND = "UNBOND",
  WITHDRAW = "-",
  OPEN_LOAN = "$+",
  CLOSE_LOAN = "$-",
}

export type CoreTxParams = {
  assetValue: AssetValue;
  recipient: string;
  memo?: string;
  feeOptionKey?: FeeOption;
  feeRate?: number;
  data?: string;
  from?: string;
  expiration?: number;
};
