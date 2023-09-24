import { DEFAULT_DECIMAL, formatBigIntToSafeValue } from '../helpers/number.ts';

type AllowedValueType = bigint | number | string;
type ArithmeticMethod = 'add' | 'sub' | 'mul' | 'div';

const toMultiplier = (decimal: number) => 10n ** BigInt(decimal);
const decimalFromMultiplier = (multiplier: bigint) => Math.log10(parseFloat(multiplier.toString()));

export class BigIntArithmetics {
  decimalMultiplier: bigint = 10n ** 8n;
  bigIntValue: bigint = 0n;
  decimal?: number;

  static fromBigInt(value: bigint, decimal?: number) {
    return new BigIntArithmetics({
      decimal,
      value: formatBigIntToSafeValue({ value, bigIntDecimal: decimal, decimal }),
    });
  }

  static shiftDecimals({
    value,
    from,
    to,
  }: {
    value: BigIntArithmetics | string | number;
    from: number;
    to: number;
  }) {
    return BigIntArithmetics.fromBigInt(
      (new BigIntArithmetics(value).bigIntValue * toMultiplier(to)) / toMultiplier(from),
      to,
    );
  }

  constructor(
    valueOrParams:
      | BigIntArithmetics
      | string
      | number
      | { decimal?: number; value: number | string },
  ) {
    const complexInit = typeof valueOrParams === 'object';
    const value = complexInit ? valueOrParams.value : valueOrParams;
    this.decimal = complexInit ? valueOrParams.decimal : undefined;

    // use the multiplier to keep track of decimal point - defaults to 8 if lower than 8
    this.decimalMultiplier = toMultiplier(
      Math.max(this.#getFloatDecimals(this.#toSafeValue(value)), this.decimal || 0),
    );
    this.#setValue(value);
  }

  get unsafeNumber() {
    return parseFloat((this.bigIntValue / this.decimalMultiplier).toString());
  }
  get baseValue() {
    return this.#getBaseValue('string') as string;
  }
  get baseValueNumber() {
    return this.#getBaseValue('number') as number;
  }
  get baseValueBigInt() {
    return this.#getBaseValue('number') as bigint;
  }
  get value() {
    return this.formatBigIntToSafeValue(
      this.bigIntValue,
      this.decimal || decimalFromMultiplier(this.decimalMultiplier),
    );
  }

  add(...args: (BigIntArithmetics | string | number)[]) {
    return this.#arithmetics('add', ...args);
  }
  sub(...args: (BigIntArithmetics | string | number)[]) {
    return this.#arithmetics('sub', ...args);
  }
  mul(...args: (BigIntArithmetics | string | number)[]) {
    return this.#arithmetics('mul', ...args);
  }
  div(...args: (BigIntArithmetics | string | number)[]) {
    return this.#arithmetics('div', ...args);
  }
  gt(value: BigIntArithmetics | string | number) {
    return this.bigIntValue > this.getBigIntValue(value);
  }
  gte(value: BigIntArithmetics | string | number) {
    return this.bigIntValue >= this.getBigIntValue(value);
  }
  lt(value: BigIntArithmetics | string | number) {
    return this.bigIntValue < this.getBigIntValue(value);
  }
  lte(value: BigIntArithmetics | string | number) {
    return this.bigIntValue <= this.getBigIntValue(value);
  }
  eqValue(value: BigIntArithmetics | string | number) {
    return this.bigIntValue === this.getBigIntValue(value);
  }

  getBigIntValue(value: BigIntArithmetics | string | number, decimal?: number) {
    if (!decimal && typeof value === 'object') return value.bigIntValue;

    value = typeof value === 'object' ? value.value : value;
    return this.#toBigInt(this.#toSafeValue(value), decimal);
  }

  formatBigIntToSafeValue(value: bigint, decimal?: number) {
    const bigIntDecimal = decimal || this.decimal || DEFAULT_DECIMAL;
    const decimalToUseForConversion = Math.max(
      bigIntDecimal,
      decimalFromMultiplier(this.decimalMultiplier),
    );
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

  toSignificant(significantDigits?: number) {
    const value = this.value.split('.');
    const integer = value[0];
    const decimal = value[1];

    if (decimal) {
      return `${integer}.${decimal.slice(0, significantDigits || this.decimal)}`.replace(
        /\.?0*$/,
        '',
      );
    }

    return integer;
  }

  #arithmetics(method: ArithmeticMethod, ...args: (BigIntArithmetics | string | number)[]): this {
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
      (this.bigIntValue * precisionDecimalMultiplier) / this.decimalMultiplier,
    );

    const value = formatBigIntToSafeValue({
      bigIntDecimal: precisionDecimal,
      decimal: Math.max(precisionDecimal, decimalFromMultiplier(this.decimalMultiplier)),
      value: result,
    });

    // @ts-expect-error - we know that the constructor is the same as the current class
    return new this.constructor({ decimal: this.decimal, value, identifier: this.toString() });
  }

  #setValue(value: AllowedValueType, bigIntValue?: bigint) {
    const safeValue = this.#toSafeValue(value) || '0';
    this.bigIntValue = bigIntValue || this.#toBigInt(safeValue);
  }

  #retrievePrecisionDecimal(...args: (BigIntArithmetics | AllowedValueType)[]) {
    const decimals = args
      .map((arg) =>
        typeof arg === 'object'
          ? arg.decimal || decimalFromMultiplier(arg.decimalMultiplier)
          : this.#getFloatDecimals(this.#toSafeValue(arg)),
      )
      .filter(Boolean) as number[];
    return Math.max(...decimals, DEFAULT_DECIMAL);
  }

  #toBigInt(value: string, decimal?: number) {
    const multiplier = decimal ? toMultiplier(decimal) : this.decimalMultiplier;
    const padDecimal = decimalFromMultiplier(multiplier);
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

  #getFloatDecimals(value: string) {
    const decimals = value.split('.')[1]?.length || 0;
    return Math.max(decimals, DEFAULT_DECIMAL);
  }

  #getBaseValue<T extends 'number' | 'string' | 'bigint'>(type: T) {
    const divisor = this.decimalMultiplier / toMultiplier(this.decimal || 0);
    const baseValue = this.bigIntValue / divisor;

    switch (type) {
      case 'number':
        return Number(baseValue);
      case 'string':
        return baseValue.toString();
      default:
        return baseValue;
    }
  }
}
