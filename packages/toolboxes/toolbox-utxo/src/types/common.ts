import { Chain, TxParams, UTXO, WalletTxParams } from '@thorswap-lib/types';

import { BlockchairApiType } from '../api/blockchairApi.js';

type TransactionType = {
  toHex(): string;
};

export type TransactionBuilderType = {
  inputs: any[];
  sign(
    vin: number,
    keyPair: KeyPairType,
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void;
  build(): TransactionType;
};

export type UTXOChain = Chain.Bitcoin | Chain.BitcoinCash | Chain.Dogecoin | Chain.Litecoin;

export type KeyPairType = {
  getAddress(index?: number): string;
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
