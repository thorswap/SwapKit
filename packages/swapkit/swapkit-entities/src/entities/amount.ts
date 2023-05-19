import { BaseDecimal } from '@thorswap-lib/types';
import { BigNumber } from 'bignumber.js';

import { BN_FORMAT } from '../helpers/asset.js';

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

export enum AmountType {
  BASE_AMOUNT,
  ASSET_AMOUNT,
}

const roundingMode = {
  [Rounding.ROUND_DOWN]: BigNumber.ROUND_DOWN,
  [Rounding.ROUND_HALF_UP]: BigNumber.ROUND_HALF_UP,
  [Rounding.ROUND_UP]: BigNumber.ROUND_UP,
};

export const EMPTY_FORMAT: BigNumber.Format = {
  groupSeparator: '',
  decimalSeparator: '.',
};

export class Amount {
  public readonly assetAmount: BigNumber;
  public readonly baseAmount: BigNumber;
  public readonly decimal: number;

  public static fromMidgard(amount?: BigNumber.Value) {
    return new Amount(amount || 0, AmountType.BASE_AMOUNT, BaseDecimal.THOR);
  }

  public static fromBaseAmount(amount: BigNumber.Value, decimal: number) {
    return new Amount(amount, AmountType.BASE_AMOUNT, decimal);
  }

  public static fromAssetAmount(amount: BigNumber.Value, decimal: number) {
    return new Amount(amount, AmountType.ASSET_AMOUNT, decimal);
  }

  public static fromNormalAmount(amount?: BigNumber.Value) {
    return new Amount(amount || 0, AmountType.ASSET_AMOUNT, 1);
  }

  public static sorter(a: Amount, b: Amount) {
    if (a.decimal !== b.decimal) throw new Error('Decimal must be same');

    return a.assetAmount.minus(b.assetAmount).toNumber();
  }

  constructor(amount: BigNumber.Value, type: AmountType = AmountType.BASE_AMOUNT, decimal: number) {
    this.decimal = decimal;
    const decimalAmount = 10 ** decimal;

    if (type === AmountType.BASE_AMOUNT) {
      this.baseAmount = new BigNumber(amount);
      this.assetAmount = this.baseAmount.dividedBy(decimalAmount);
    } else {
      this.assetAmount = new BigNumber(amount);
      this.baseAmount = this.assetAmount.multipliedBy(decimalAmount);
    }

    // remove decimal points for baseAmount
    this.baseAmount = new BigNumber(this.baseAmount.integerValue(BigNumber.ROUND_DOWN));
  }

  add(amount: Amount) {
    return new Amount(
      this.assetAmount.plus(amount.assetAmount),
      AmountType.ASSET_AMOUNT,
      this.decimal,
    );
  }

  sub(amount: Amount) {
    return new Amount(
      this.assetAmount.minus(amount.assetAmount),
      AmountType.ASSET_AMOUNT,
      this.decimal,
    );
  }

  mul(value: BigNumber.Value | Amount) {
    if (value instanceof Amount) {
      return new Amount(
        this.assetAmount.multipliedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    }
    return new Amount(this.assetAmount.multipliedBy(value), AmountType.ASSET_AMOUNT, this.decimal);
  }

  div(value: BigNumber.Value | Amount) {
    if (value instanceof Amount) {
      return new Amount(
        this.assetAmount.dividedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    }
    return new Amount(this.assetAmount.dividedBy(value), AmountType.ASSET_AMOUNT, this.decimal);
  }

  gte(amount: Amount | BigNumber.Value) {
    if (amount instanceof Amount) {
      return this.assetAmount.isGreaterThanOrEqualTo(amount.assetAmount);
    }

    return this.assetAmount.isGreaterThanOrEqualTo(amount);
  }

  gt(amount: Amount | BigNumber.Value) {
    if (amount instanceof Amount) {
      return this.assetAmount.isGreaterThan(amount.assetAmount);
    }

    return this.assetAmount.isGreaterThan(amount);
  }

  lte(amount: Amount | BigNumber.Value) {
    if (amount instanceof Amount) {
      return this.assetAmount.isLessThanOrEqualTo(amount.assetAmount);
    }

    return this.assetAmount.isLessThanOrEqualTo(amount);
  }

  lt(amount: Amount | BigNumber.Value) {
    if (amount instanceof Amount) {
      return this.assetAmount.isLessThan(amount.assetAmount);
    }

    return this.assetAmount.isLessThan(amount);
  }

  eq(amount: Amount | BigNumber.Value) {
    if (amount instanceof Amount) {
      return this.assetAmount.isEqualTo(amount.assetAmount);
    }

    return this.assetAmount.isEqualTo(amount);
  }

  toSignificant(
    significantDigits = 8,
    maxDecimals = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return this.toSignificantBigNumber(significantDigits, format, rounding)
      .decimalPlaces(maxDecimals)
      .toFormat();
  }

  toFixedDecimal(
    decimalPlaces = 8,
    format: BigNumber.Format = EMPTY_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    if (!Number.isInteger(decimalPlaces)) throw new Error(`${decimalPlaces} is not an integer.`);
    if (decimalPlaces <= 0) throw new Error(`${decimalPlaces} is not positive.`);

    BigNumber.config({ FORMAT: format });
    const fixed = new BigNumber(this.assetAmount.toFixed(decimalPlaces, roundingMode[rounding]));

    return fixed.toFormat();
  }

  toFixed(
    decimalPlaces = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return this.toFixedDecimal(decimalPlaces, format, rounding);
  }

  toAbbreviate(decimalPlaces = 2) {
    let newValue = this.assetAmount.toNumber();
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'Q', 's'];
    let suffixNum = 0;

    while (newValue >= 1000) {
      newValue /= 1000;
      suffixNum++;
    }

    return `${newValue.toFixed(decimalPlaces)}${suffixNum > 0 ? ` ${suffixes[suffixNum]}` : ''}`;
  }

  private toSignificantBigNumber(
    significantDigits = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    if (!Number.isInteger(significantDigits))
      throw new Error(`${significantDigits} is not an integer.`);
    if (significantDigits <= 0) throw new Error(`${significantDigits} is not positive.`);

    BigNumber.config({ FORMAT: format });

    return new BigNumber(this.assetAmount.toPrecision(significantDigits, roundingMode[rounding]));
  }
}

export const formatBigNumber = (
  bn: BigNumber,
  decimalPlaces = 8,
  rounding: Rounding = Rounding.ROUND_DOWN,
) => {
  BigNumber.config({ FORMAT: BN_FORMAT });
  const fixed = new BigNumber(bn.toFixed(decimalPlaces, roundingMode[rounding]));

  return fixed.toFormat();
};
