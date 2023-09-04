import type { FeeOption, TxParams, UTXO, UTXOChain, WalletTxParams } from '@thorswap-lib/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '../index.ts';
import type { UTXOScriptType } from '../utils/index.ts';

export type TransactionType = {
  toHex(): string;
};

export type TransactionBuilderType = {
  inputs: any[];
  sign(
    vin: number,
    keyPair: { getAddress: (index?: number) => string },
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void;
  build(): TransactionType;
};

export type Witness = {
  value: number;
  script: Buffer;
};

export type UTXOBaseToolboxParams = {
  apiClient: BlockchairApiType;
  chain: UTXOChain;
};

export type UTXOBuildTxParams = TxParams & {
  feeRate: number;
  sender: string;
  fetchTxHex?: boolean;
};

export type UTXOTransferParams = WalletTxParams & {
  feeRate?: number;
};

export type UTXOWalletTransferParams<T, U> = UTXOTransferParams & {
  signTransaction: (params: T) => Promise<U>;
};

export type UTXOCreateKeyParams = { phrase?: string; wif?: string; derivationPath: string };

export type TransferParams = UTXOWalletTransferParams<
  { builder: TransactionBuilderType; utxos: UTXO[] },
  TransactionType
>;

export type ScanUTXOsParams = { address: string; fetchTxHex?: boolean };

export type TargetOutput = { address: string; value: number } | { script: Buffer; value: number };

export type UTXOToolbox = ReturnType<
  typeof BTCToolbox | typeof BCHToolbox | typeof DOGEToolbox | typeof LTCToolbox
>;

export type UTXOEstimateFeeParams = {
  from: string;
  recipients?: number | TargetOutput[];
  memo?: string;
  feeOptionKey?: FeeOption;
  feeRate?: number;
};

export type UTXOInputWithScriptType = UTXO & { type: UTXOScriptType; address: string };

export type UTXOCalculateTxSizeParams = {
  inputs: (UTXOInputWithScriptType | UTXO)[];
  outputs?: TargetOutput[];
  feeRate: number;
};
