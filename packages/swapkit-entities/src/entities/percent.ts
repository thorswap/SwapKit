import { type BigNumber } from 'bignumber.js';

import { BN_FORMAT } from '../constants.js';

import { Amount, AmountType, EMPTY_FORMAT, Rounding } from './amount.js';

export class Percent extends Amount {
  constructor(amount: BigNumber.Value, type: AmountType = AmountType.ASSET_AMOUNT) {
    // Decimal point for percent is 2
    super(amount, type, 2);
  }

  toSignificant(
    significantDigits = 8,
    format: BigNumber.Format = EMPTY_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return `${super.mul(100).toSignificant(significantDigits, format, rounding)} %`;
  }

  toSignificantWithMaxDecimals(
    significantDigits = 8,
    maxDecimals = 8,
    format: BigNumber.Format = EMPTY_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return `${super
      .mul(100)
      .toSignificantWithMaxDecimals(significantDigits, maxDecimals, format, rounding)} %`;
  }

  toFixed(
    decimalPlaces = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return `${super.mul(100).toFixed(decimalPlaces, format, rounding)} %`;
  }
}
