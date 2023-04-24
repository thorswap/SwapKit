import { BigNumberish } from '@ethersproject/bignumber';

import { AmountWithBaseDenom } from './amount.js';
import { Asset } from './asset.js';
import { Address } from './commonTypes.js';
import { FeeOption } from './wallet.js';

export enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

export type WalletTxParams = TxParams & {
  from?: string;
};

export type TxTo = {
  to: string; // address
  amount: AmountWithBaseDenom; // amount
  asset?: Asset; // asset
};

export type TxFrom = {
  from: string; // address or tx id
  amount: AmountWithBaseDenom; // amount
  asset?: Asset; // asset
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
  walletIndex?: number; // send from this HD index
  asset?: Asset;
  amount: AmountWithBaseDenom;
  recipient: Address;
  memo?: string; // optional memo to pass
  feeOptionKey?: FeeOption;
};

export type TxsPage = {
  total: number;
  txs: Tx[];
};

export type TxHistoryParams = {
  address: string; // Address to get history for
  offset?: number; // Optional Offset
  limit?: number; // Optional Limit of transactions
  startTime?: Date; // Optional start time
  asset?: string; // Optional asset. Result transactions will be filtered by this asset
};

type Coin = {
  asset: Asset;
  amount: AmountWithBaseDenom;
};

export type MultiTransfer = {
  to: Address;
  coins: Coin[];
};

export type MultiSendParams = {
  walletIndex?: number;
  transactions: MultiTransfer[];
  memo?: string;
};

export type EIP1559TxParams<T = BigNumberish> = {
  nonce?: number;
  from?: string;
  to?: string;
  data?: string;
  value?: T;
  gasLimit?: T;
  maxFeePerGas?: T;
  maxPriorityFeePerGas?: T;
  chainId?: number;
};

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
