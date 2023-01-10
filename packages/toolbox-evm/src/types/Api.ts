import { Balance, Tx, TxsPage } from '@thorswap-lib/types';

export interface EvmApi<P> {
  getTxInfo(params: P): Promise<Tx>;
  getTransactionsForAddress(params: P): Promise<TxsPage>;
  getBalance(params: P): Promise<Balance[]>;
}
