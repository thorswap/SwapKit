import type { BigNumberish } from 'ethers';

type AmountWithDenom<U = BigNumberish> = {
  amount: () => U;
  plus: (value: U | AmountWithDenom<U>, decimal?: number) => AmountWithDenom<U>;
  minus: (value: U | AmountWithDenom<U>, decimal?: number) => AmountWithDenom<U>;
  times: (value: U | AmountWithDenom<U>, decimal?: number) => AmountWithDenom<U>;
  div: (value: U | AmountWithDenom<U>, decimal?: number) => AmountWithDenom<U>;
  gt: (value: U | AmountWithDenom<U>) => boolean;
  gte: (value: U | AmountWithDenom<U>) => boolean;
  lt: (value: U | AmountWithDenom<U>) => boolean;
  lte: (value: U | AmountWithDenom<U>) => boolean;
  eq: (value: U | AmountWithDenom<U>) => boolean;
  decimal: number;
};

export type AmountWithBaseDenom = AmountWithDenom<BigNumberish>;
