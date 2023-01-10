import { BigNumber, BigNumberish, parseFixed } from '@ethersproject/bignumber';
import {
  type AmountWithAssetDenom,
  type AmountWithBaseDenom,
  Denomination,
} from '@thorswap-lib/types';

import { isBigNumberValue } from './bigNumber.js';

type Value = BigNumberish | AmountWithBaseDenom;

export const baseAmount = (value?: BigNumberish, decimal: number = 8): AmountWithBaseDenom => {
  const amount = BigNumber.from(value || 0);

  return {
    type: Denomination.Base,
    amount: () => amount,
    plus: (v: Value, d: number = decimal) =>
      baseAmount(amount.add(isBigNumberValue(v) ? v : v.amount()), d),
    minus: (v: Value, d: number = decimal) =>
      baseAmount(amount.sub(isBigNumberValue(v) ? v : v.amount()), d),
    times: (v: Value, d: number = decimal) =>
      baseAmount(amount.mul(isBigNumberValue(v) ? v : v.amount()), d),
    div: (v: Value, d: number = decimal) =>
      baseAmount(amount.div(isBigNumberValue(v) ? v : v.amount()), d),
    lt: (v: Value) => amount.lt(isBigNumberValue(v) ? v : v.amount()),
    lte: (v: Value) => amount.lte(isBigNumberValue(v) ? v : v.amount()),
    gt: (v: Value) => amount.gt(isBigNumberValue(v) ? v : v.amount()),
    gte: (v: Value) => amount.gte(isBigNumberValue(v) ? v : v.amount()),
    eq: (v: Value) => amount.eq(isBigNumberValue(v) ? v : v.amount()),
    decimal,
  };
};

export const assetToBase = ({ amount, decimal }: AmountWithAssetDenom) =>
  baseAmount(parseFixed(amount().toString(), decimal), decimal);
