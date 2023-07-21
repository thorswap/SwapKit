import { BigNumber, BigNumberish, parseFixed } from '@ethersproject/bignumber';
import { isBytesLike } from '@ethersproject/bytes';
import { formatUnits } from '@ethersproject/units';
import { Denomination } from '@thorswap-lib/types';

export type Numberish = BigNumberish | SwapkitNumber;

/*
 * SwapkitNumber is a wrapper around BigNumber that stores the asset denominated
 * value and the number of decimals.
 * It allows calculations of asset and base denominated numbers without parsing.
 */
export class SwapkitNumber {
  value: string;
  decimals: number;
  readonly _isSwapkitNumber = true;

  constructor(value: Numberish | undefined, decimals?: number, valueDenomination?: Denomination) {
    if (value instanceof SwapkitNumber) {
      this.value = value.value;
      this.decimals = value.decimals;
      return;
    }

    if (
      valueDenomination === Denomination.Base ||
      SwapkitNumber.isBaseDenominated(value, true) ||
      value instanceof BigNumber
    ) {
      this.decimals = decimals || 18;
      this.value = formatUnits(BigNumber.from(value), this.decimals);
      return;
    }

    if (!value) {
      value = '0';
    }
    if (typeof value === 'number') {
      value = value.toString();
    }
    if (typeof value === 'string' && !RegExp('^-?[0-9]+([.][0-9]+)?$').test(value)) {
      throw new Error(`Invalid number: ${value.toString()}`);
    }
    this.value = value as string;
    this.decimals = decimals || (value as string).split('.')[1]?.length || 0;
  }

  /*
   * Create a SwapkitNumber from an asset denominated string or number value
   */
  static from(value: Numberish | undefined, decimals?: number, valueDenomination?: Denomination) {
    if (value instanceof SwapkitNumber) {
      return value;
    }

    return new SwapkitNumber(value, decimals, valueDenomination);
  }

  toString() {
    return this.value;
  }

  toAssetString() {
    return this.toString();
  }

  toBaseString(decimals: number = 18) {
    return formatUnits(parseFixed(this.value, this.decimals), decimals);
  }

  toNumber() {
    return parseFloat(this.value);
  }

  toBaseNumber() {
    return BigNumber.from(this.value).toNumber();
  }

  add(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToAdd = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToAdd.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return new SwapkitNumber(
      formatUnits(baseValue.add(parseFixed(numberToAdd.value, newDecimals)), newDecimals),
    );
  }

  sub(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToSub = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToSub.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return new SwapkitNumber(
      formatUnits(baseValue.sub(parseFixed(numberToSub.value, newDecimals)), newDecimals),
    );
  }

  mul(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToMul = SwapkitNumber.from(value, decimals, denomination);
    const baseValue = parseFixed(this.value, this.decimals);

    return new SwapkitNumber(
      formatUnits(
        baseValue.mul(parseFixed(numberToMul.value, numberToMul.decimals)),
        numberToMul.decimals + this.decimals,
      ),
    );
  }

  div(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const baseValue = parseFixed(this.value, 18);
    const numberToDiv = SwapkitNumber.from(value, decimals, denomination);

    const result = formatUnits(baseValue.div(parseFixed(numberToDiv.value, 18)), 18);

    return new SwapkitNumber(result.replace(/\.?0+$/, ''));
  }

  e(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToEq = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToEq.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return baseValue.eq(parseFixed(numberToEq.value, newDecimals));
  }

  gt(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToGt = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToGt.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return baseValue.gt(parseFixed(numberToGt.value, newDecimals));
  }

  gte(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToGte = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToGte.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return baseValue.gte(parseFixed(numberToGte.value, newDecimals));
  }

  lt(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToLt = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToLt.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return baseValue.lt(parseFixed(numberToLt.value, newDecimals));
  }

  lte(value: Numberish | undefined, decimals?: number, denomination?: Denomination) {
    const numberToLte = SwapkitNumber.from(value, decimals, denomination);
    const newDecimals = Math.max(numberToLte.decimals, this.decimals);
    const baseValue = parseFixed(this.value, newDecimals);

    return baseValue.lte(parseFixed(numberToLte.value, newDecimals));
  }

  static isBaseDenominated(value: Numberish | undefined, strict: boolean = false) {
    if (value instanceof SwapkitNumber) {
      return false;
    }

    // First check if it is a bytesLike or a bigint
    if (isBytesLike(value) || typeof value === 'bigint') {
      return true;
    }

    // Strict mode:
    // strings and numbers that are not bytesLike are interpreted as asset denominated
    if (strict && (typeof value === 'string' || typeof value === 'number')) {
      return false;
    }

    // Non-strict mode:
    // Check if the string or number is a float
    if (
      !value ||
      (typeof value === 'string' && (value as string).includes('.')) ||
      (typeof value === 'number' && value % 1 !== 0)
    ) {
      return false;
    }

    // Try to parse it into a BigNumber to catch invalid values
    try {
      BigNumber.from(value);
    } catch (error) {
      throw new Error(`Invalid number: ${value.toString()}`);
    }

    return true;
  }
}
