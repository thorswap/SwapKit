import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export class SafeNumber {
  value: string;
  decimals: number;

  constructor(value: string | number | undefined) {
    if (value === '' || value === undefined) {
      value = '0';
    }
    if (typeof value === 'number') {
      value = value.toString();
    }
    if (!RegExp('^-?[0-9]+([.][0-9]+)?$').test(value)) {
      throw new Error(`Invalid number: ${value.toString()}`);
    }
    this.value = value;
    this.decimals = value.split('.')[1]?.length || 0;
  }

  static from(value: BigNumber | string | number | undefined) {
    if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
      return new SafeNumber(value as string | number | undefined);
    }

    return new SafeNumber(formatUnits(value.toString(), 18));
  }

  toString() {
    return this.value;
  }

  toAssetString() {
    return this.toString();
  }

  toBaseString() {
    return formatUnits(parseFixed(this.value, this.decimals), 18);
  }

  toNumber() {
    return BigNumber.from(this.value).toNumber();
  }

  add(value: BigNumber | string | number | undefined) {
    const numberToAdd = SafeNumber.from(value);
    const decimals = Math.max(numberToAdd.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return new SafeNumber(
      formatUnits(baseValue.add(parseFixed(numberToAdd.value, decimals)), decimals),
    );
  }

  sub(value: BigNumber | string | number | undefined) {
    const numberToSub = SafeNumber.from(value);
    const decimals = Math.max(numberToSub.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return new SafeNumber(
      formatUnits(baseValue.sub(parseFixed(numberToSub.value, decimals)), decimals),
    );
  }

  mul(value: BigNumber | string | number | undefined) {
    const numberToMul = SafeNumber.from(value);
    const baseValue = parseFixed(this.value, this.decimals);

    return new SafeNumber(
      formatUnits(
        baseValue.mul(parseFixed(numberToMul.value, numberToMul.decimals)),
        numberToMul.decimals + this.decimals,
      ),
    );
  }

  div(value: BigNumber | string | number | undefined) {
    const baseValue = parseFixed(this.value, 18);
    const numberToDiv = SafeNumber.from(value);

    const result = formatUnits(baseValue.div(parseFixed(numberToDiv.value, 18)), 18);

    return new SafeNumber(result.replace(/\.?0+$/, ''));
  }

  eq(value: BigNumber | string | number | undefined) {
    const numberToEq = SafeNumber.from(value);
    const decimals = Math.max(numberToEq.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return baseValue.eq(parseFixed(numberToEq.value, decimals));
  }

  gt(value: BigNumber | string | number | undefined) {
    const numberToGt = SafeNumber.from(value);
    const decimals = Math.max(numberToGt.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return baseValue.gt(parseFixed(numberToGt.value, decimals));
  }

  gte(value: BigNumber | string | number | undefined) {
    const numberToGte = SafeNumber.from(value);
    const decimals = Math.max(numberToGte.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return baseValue.gte(parseFixed(numberToGte.value, decimals));
  }

  lt(value: BigNumber | string | number | undefined) {
    const numberToLt = SafeNumber.from(value);
    const decimals = Math.max(numberToLt.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return baseValue.lt(parseFixed(numberToLt.value, decimals));
  }

  lte(value: BigNumber | string | number | undefined) {
    const numberToLte = SafeNumber.from(value);
    const decimals = Math.max(numberToLte.decimals, this.decimals);
    const baseValue = parseFixed(this.value, decimals);

    return baseValue.lte(parseFixed(numberToLte.value, decimals));
  }
}
