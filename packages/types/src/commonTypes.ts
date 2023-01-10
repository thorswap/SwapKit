import { FixedNumber } from '@ethersproject/bignumber';

export type TxHash = string;

export type Address = string;

export type CommonTxParams = {
  asset: string; // BNB.RUNE-B1A, BTC.BTC, ETH.USDT-0xffffff
  amount: number;
  decimal: number;
  recipient: string;
  memo?: string;
};

export type UTXO = {
  hash: string;
  index: number;
  value: number;
  txHex?: string;
  witnessUtxo?: Witness;
};

export type Witness = {
  value: number;
  script: Buffer;
};

export type FixedNumberish = string | number | FixedNumber;

export type AminoWrapping<T> = {
  type: string;
  value: T;
};
