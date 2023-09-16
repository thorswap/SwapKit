import type { UTXOChain } from '@thorswap-lib/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '../index.ts';
import type { UTXOScriptType } from '../utils/index.ts';

export type TransactionType = {
  toHex(): string;
};

export type TargetOutput = { address: string; value: number; script?: Buffer };

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

export type UTXOToolbox = ReturnType<
  typeof BTCToolbox | typeof BCHToolbox | typeof DOGEToolbox | typeof LTCToolbox
>;

export type UTXOType = {
  hash: string;
  index: number;
  value: number;
  txHex?: string;
  witnessUtxo?: Witness;
};

export type UTXOInputWithScriptType = UTXOType & { type: UTXOScriptType; address: string };

export type UTXOCalculateTxSizeParams = {
  inputs: (UTXOInputWithScriptType | UTXOType)[];
  outputs?: TargetOutput[];
  feeRate: number;
};
