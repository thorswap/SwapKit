import { BigNumberish } from '@ethersproject/bignumber';

import { AmountWithBaseDenom } from './amount.js';
import { Asset } from './asset.js';
import { Address } from './commonTypes.js';
import { FeeOption } from './wallet.js';

enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

type TxTo = {
  to: string; // address
  amount: AmountWithBaseDenom; // amount
  asset?: Asset; // asset
};

type TxFrom = {
  from: string; // address or tx id
  amount: AmountWithBaseDenom; // amount
  asset?: Asset; // asset
};

export type WalletTxParams = TxParams & {
  from?: string;
};

export type Tx = {
  asset: Asset; // asset
  from: TxFrom[]; // list of "from" txs. BNC will have one `TxFrom` only, `BTC` might have many transactions going "in" (based on UTXO)
  to: TxTo[]; // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date; // timestamp of tx
  type: TxType; // type
  hash: string; // Tx hash
};

export type TxParams = {
  asset?: Asset;
  amount: AmountWithBaseDenom;
  recipient: Address;
  memo?: string; // optional memo to pass
  feeOptionKey?: FeeOption;
};

type EVMTxBaseParams<T = BigNumberish> = {
  to?: string;
  from?: string;
  nonce?: number;
  gasLimit?: T;
  data?: string;
  value?: T;
  chainId?: number;
};

export type EIP1559TxParams<T = BigNumberish> = EVMTxBaseParams<T> & {
  type?: number;
  maxFeePerGas?: T;
  maxPriorityFeePerGas?: T;
};

export type LegacyEVMTxParams<T = BigNumberish> = EVMTxBaseParams<T> & {
  gasPrice?: T;
};

export type EVMTxParams = EIP1559TxParams | LegacyEVMTxParams;

export type DepositParams = TxParams & {
  router?: string;
  from?: string;
};

export type CallParams = {
  walletIndex?: number;
  contractAddress: string;
  abi: any;
  funcName: string;
  funcParams?: unknown[];
};
