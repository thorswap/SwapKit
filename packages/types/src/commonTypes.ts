import { FixedNumber } from '@ethersproject/bignumber';

export type TxHash = string;

export type Address = string;

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
