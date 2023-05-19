import { Balance } from '@thorswap-lib/types';

export interface EvmApi<P> {
  getBalance(params: P): Promise<Balance[]>;
}
