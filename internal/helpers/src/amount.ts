import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { AmountWithBaseDenom, Denomination } from '@thorswap-lib/types';

type Value = BigNumberish | AmountWithBaseDenom;

const isBigNumberValue = (v: unknown): v is BigNumberish =>
  typeof v === 'string' || typeof v === 'number' || v instanceof BigNumber;

export const baseAmount = (value?: BigNumberish, decimal: number = 8): AmountWithBaseDenom => {
  const amount = BigNumber.from(value || 0);

  return {
    type: Denomination.Base,
    amount: () => amount,
    plus: (v: Value, d: number = decimal) =>
      baseAmount(amount.add(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()), d),
    minus: (v: Value, d: number = decimal) =>
      baseAmount(amount.sub(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()), d),
    times: (v: Value, d: number = decimal) =>
      baseAmount(amount.mul(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()), d),
    div: (v: Value, d: number = decimal) =>
      baseAmount(amount.div(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()), d),
    lt: (v: Value) => amount.lt(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()),
    lte: (v: Value) => amount.lte(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()),
    gt: (v: Value) => amount.gt(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()),
    gte: (v: Value) => amount.gte(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()),
    eq: (v: Value) => amount.eq(isBigNumberValue(v) ? v : (v as AmountWithBaseDenom).amount()),
    decimal,
  };
};
