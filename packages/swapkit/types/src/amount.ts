import { BigNumber, FixedNumber } from '@ethersproject/bignumber';

export enum Denomination {
  /**
   * values for asset amounts in base units (no decimal)
   */
  Base = 'BASE',
  /**
   * values of asset amounts (w/ decimal)
   */
  Asset = 'ASSET',
}

type AmountWithDenom<T, U = BigNumber | FixedNumber> = T extends Denomination
  ? {
      type: T;
      amount: () => U;
      plus: (value: U | AmountWithDenom<T, U>, decimal?: number) => AmountWithDenom<T, U>;
      minus: (value: U | AmountWithDenom<T, U>, decimal?: number) => AmountWithDenom<T, U>;
      times: (value: U | AmountWithDenom<T, U>, decimal?: number) => AmountWithDenom<T, U>;
      div: (value: U | AmountWithDenom<T, U>, decimal?: number) => AmountWithDenom<T, U>;
      gt: (value: U | AmountWithDenom<T, U>) => boolean;
      gte: (value: U | AmountWithDenom<T, U>) => boolean;
      lt: (value: U | AmountWithDenom<T, U>) => boolean;
      lte: (value: U | AmountWithDenom<T, U>) => boolean;
      eq: (value: U | AmountWithDenom<T, U>) => boolean;
      decimal: number;
    }
  : never;

export type AmountWithBaseDenom = AmountWithDenom<Denomination.Base, BigNumber>;
export type AmountWithAssetDenom = AmountWithDenom<Denomination.Asset, FixedNumber>;
