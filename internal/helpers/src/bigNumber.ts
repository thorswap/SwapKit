import { BigNumber, BigNumberish, FixedNumber, parseFixed } from '@ethersproject/bignumber';
import { FixedNumberish } from '@thorswap-lib/types';

export const fixedNumber = (value: FixedNumberish | undefined, decimal: BigNumberish) =>
  FixedNumber.fromValue(parseFixed(value?.toString() || '0', decimal), decimal);
export const isValidFixedNumber = (value: FixedNumberish | undefined) =>
  value instanceof FixedNumber;
export const isFixedNumberValue = (v: unknown): v is FixedNumberish =>
  typeof v === 'string' || typeof v === 'number' || v instanceof FixedNumber;
export const isBigNumberValue = (v: unknown): v is BigNumberish =>
  typeof v === 'string' || typeof v === 'number' || v instanceof BigNumber;

export const fixedBN = (value: BigNumberish | undefined, decimalPlaces: BigNumberish = 2) =>
  FixedNumber.fromValue(BigNumber.from(value || 0), decimalPlaces);

export const bnOrZero = (value: string | number | undefined) => {
  const b = value ? FixedNumber.from(value) : FixedNumber.from(0);
  return isValidFixedNumber(b) ? b : FixedNumber.from(0);
};
