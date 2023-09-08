import {
  decimalFromMultiplier,
  DEFAULT_DECIMAL,
  formatBigIntToSafeValue,
} from '../helpers/number.ts';

type AllowedValueType = bigint | number | string;
type ArithmeticMethod = 'add' | 'sub' | 'mul' | 'div';
type SwapKitValueType = BaseSwapKitNumber | string | number;

const toMultiplier = (decimal: number) => 10n ** BigInt(decimal);
type Params = string | number | { decimal?: number; value: number | string };

export class BaseSwapKitNumber {
  #decimalMultiplier: bigint = 10n ** 8n;
  bigIntValue: bigint = 0n;
  decimal?: number;
  //   value: number = 0;
  //   safeValue: string = '0';

  constructor(valueOrParams: Params) {
    const complexInit = typeof valueOrParams === 'object';
    const value = complexInit ? valueOrParams.value : valueOrParams;

    this.decimal = complexInit ? valueOrParams.decimal : undefined;
    // use the multiplier to keep track of decimal point - defaults to 8 if lower than 8
    this.#decimalMultiplier = toMultiplier(
      Math.max(this.#getFloatDecimals(this.#toSafeValue(value)), this.decimal || 0),
    );
    this.#setValue(value);
  }

  get unsafeNumber() {
    return parseFloat((this.bigIntValue / this.#decimalMultiplier).toString());
  }

  get value() {
    return this.#formatBigIntToSafeValue(
      this.bigIntValue,
      this.decimal || this.#decimalsFromMultipler(),
    );
  }

  static fromBigInt(value: bigint, decimal?: number) {
    return new BaseSwapKitNumber({ decimal, value: formatBigIntToSafeValue(value, decimal) });
  }

  add(...args: SwapKitValueType[]) {
    return this.#arithmetics('add', ...args);
  }
  sub(...args: SwapKitValueType[]) {
    return this.#arithmetics('sub', ...args);
  }
  mul(...args: SwapKitValueType[]) {
    return this.#arithmetics('mul', ...args);
  }
  div(...args: SwapKitValueType[]) {
    return this.#arithmetics('div', ...args);
  }

  gt(value: SwapKitValueType) {
    return this.bigIntValue > this.getBigIntValue(value);
  }
  gte(value: SwapKitValueType) {
    return this.bigIntValue >= this.getBigIntValue(value);
  }
  lt(value: SwapKitValueType) {
    return this.bigIntValue < this.getBigIntValue(value);
  }
  lte(value: SwapKitValueType) {
    return this.bigIntValue <= this.getBigIntValue(value);
  }

  decimalsFromMultiplier(multiplier: bigint = this.#decimalMultiplier) {
    return Math.log10(parseFloat(multiplier.toString()));
  }

  getBigIntValue(value: SwapKitValueType, decimal?: number) {
    if (!decimal && typeof value === 'object') return value.bigIntValue;

    value = typeof value === 'object' ? value.value : value;
    return this.#toBigInt(this.#toSafeValue(value), decimal);
  }

  toString() {
    return this.value;
  }

  #arithmetics(method: ArithmeticMethod, ...args: SwapKitValueType[]) {
    const precisionDecimal = this.#retrievePrecisionDecimal(this, ...args);
    const precisionDecimalMultiplier = toMultiplier(precisionDecimal);

    const result = args.reduce(
      (acc, arg) => {
        const value = this.getBigIntValue(arg, precisionDecimal);

        if ('div' === method && value === 0n) throw new RangeError('Division by zero');

        /**
         * Normal arithmetic - add & sub => 200000000n +- 200000000n
         */
        if ('add' === method) return acc + value;
        if ('sub' === method) return acc - value;

        /**
         * Multiplication & division would end up with wrong result if we don't adjust the value
         * 200000000n * 200000000n => 40000000000000000n
         * 200000000n / 200000000n => 1n
         * So we do the following:
         * 200000000n * 200000000n = 40000000000000000n / 100000000n (decimals) => 400000000n
         * (200000000n * 100000000n (decimals)) / 200000000n => 100000000n
         */
        if ('mul' === method) return (acc * value) / precisionDecimalMultiplier;
        // 'div' === method
        return (acc * precisionDecimalMultiplier) / value;
      },
      //normalize is to precision multiplier base
      (this.bigIntValue * precisionDecimalMultiplier) / this.#decimalMultiplier,
    );

    const value = this.#formatBigIntToSafeValue(result, precisionDecimal);

    return new BaseSwapKitNumber({ decimal: this.decimal, value });
  }

  #setValue(value: AllowedValueType, bigIntValue?: bigint) {
    // const rawValue = this.#toRawValue(value);
    // this.value = !rawValue || isNaN(rawValue) ? 0 : rawValue;
    // this.safeValue = safeValue;

    const safeValue = this.#toSafeValue(value) || '0';
    this.bigIntValue = bigIntValue || this.#toBigInt(safeValue);
  }

  #retrievePrecisionDecimal(...args: (BaseSwapKitNumber | AllowedValueType)[]) {
    const decimals = args
      .map((arg) =>
        typeof arg === 'object'
          ? arg.decimal || arg.#decimalsFromMultipler()
          : this.#getFloatDecimals(this.#toSafeValue(arg)),
      )
      .filter(Boolean) as number[];
    return Math.max(...decimals, DEFAULT_DECIMAL);
  }

  #toBigInt(value: string, decimal?: number) {
    const multiplier = decimal ? toMultiplier(decimal) : this.#decimalMultiplier;
    const padDecimal = this.#getDecimal(this.decimalsFromMultiplier(multiplier));
    const [integerPart, decimalPart = ''] = value.split('.');

    return BigInt(`${integerPart}${decimalPart.padEnd(padDecimal, '0')}`);
  }

  #toSafeValue(value: AllowedValueType) {
    const parsedValue =
      typeof value === 'number'
        ? Number(value).toLocaleString('fullwide', {
            useGrouping: false,
            maximumFractionDigits: 20,
          })
        : value;

    const splitValue = `${parsedValue}`.replaceAll(',', '.').split('.');

    return splitValue.length > 1
      ? `${splitValue.slice(0, -1).join('')}.${splitValue.at(-1)}`
      : splitValue[0];
  }

  #formatBigIntToSafeValue(value: bigint, decimal?: number) {
    const decimalFromMultiplier = this.#decimalsFromMultipler();
    const bigIntDecimal = this.#getDecimal(decimal);
    const decimalToUseForConversion = Math.max(bigIntDecimal, decimalFromMultiplier);
    const isNegative = value < 0n;

    let valueString = value.toString().substring(isNegative ? 1 : 0);

    const padLength = decimalToUseForConversion - (valueString.length - 1);

    if (padLength > 0) {
      valueString = '0'.repeat(padLength) + valueString;
    }

    const decimalIndex = valueString.length - decimalToUseForConversion;
    let decimalString = valueString.slice(-decimalToUseForConversion);

    // Check if we need to round up
    if (parseInt(decimalString[bigIntDecimal]) >= 5) {
      // Increment the last decimal place and slice off the rest
      decimalString = `${decimalString.substring(0, bigIntDecimal - 1)}${(
        parseInt(decimalString[bigIntDecimal - 1]) + 1
      ).toString()}`;
    } else {
      // Just slice off the extra digits
      decimalString = decimalString.substring(0, bigIntDecimal);
    }

    return `${isNegative ? '-' : ''}${valueString.slice(0, decimalIndex)}.${decimalString}`.replace(
      /\.?0*$/,
      '',
    );
  }

  #getDecimal(decimal?: number) {
    return decimal || this.decimal || DEFAULT_DECIMAL;
  }

  #getFloatDecimals(value: string) {
    const decimals = value.split('.')[1]?.length || 0;
    return Math.max(decimals, DEFAULT_DECIMAL);
  }

  #decimalsFromMultipler(multiplier: bigint = this.#decimalMultiplier) {
    return decimalFromMultiplier(multiplier);
  }
}

export class SwapKitNumber extends BaseSwapKitNumber {
  eq(value: SwapKitValueType) {
    return this.bigIntValue === this.getBigIntValue(value);
  }
}
