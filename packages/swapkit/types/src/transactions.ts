import type { FeeOption } from './wallet.ts';

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
