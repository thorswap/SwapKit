import { SwapKitError } from './swapKitError.ts';

type AllowedValueType = bigint | number | string;
type ArithmeticMethod = 'add' | 'sub' | 'mul' | 'div';
type SwapKitValueType = SwapKitNumber | string | number;

type Params = string | number | { decimal?: number; value: number | string; bigIntValue?: bigint };

const DEFAULT_DECIMAL = 8;

export class SwapKitNumber {
  #decimalMultiplier: bigint = 10n ** 8n;
  bigIntValue: bigint = 0n;
  decimal?: number;
  value: number = 0;
  safeValue: string = '0';

  constructor(valueOrParams: Params) {
    const complexInit = typeof valueOrParams === 'object';
    const value = complexInit ? valueOrParams.value : valueOrParams;

    this.decimal = complexInit ? valueOrParams.decimal : undefined;
    this.#decimalMultiplier = this.decimal ? 10n ** BigInt(this.decimal) : this.#decimalMultiplier;
    this.#setValue(value, complexInit ? valueOrParams.bigIntValue : undefined);
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
    return this.bigIntValue > this.#getBigIntValue(value);
  }
  gte(value: SwapKitValueType) {
    return this.bigIntValue >= this.#getBigIntValue(value);
  }
  lt(value: SwapKitValueType) {
    return this.bigIntValue < this.#getBigIntValue(value);
  }
  lte(value: SwapKitValueType) {
    return this.bigIntValue <= this.#getBigIntValue(value);
  }
  eq(value: SwapKitValueType) {
    return this.bigIntValue === this.#getBigIntValue(value);
  }

  #arithmetics(method: ArithmeticMethod, ...args: SwapKitValueType[]) {
    const decimal = this.#retrieveSingleDecimal(this, ...args);

    const result = args.reduce((acc, arg) => {
      const value = this.#getBigIntValue(arg, decimal);
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
      if ('mul' === method) return (acc * value) / this.#decimalMultiplier;
      // 'div' === method
      return (acc * this.#decimalMultiplier) / value;
    }, this.bigIntValue);

    const value = this.#formatToSafeValue(result, decimal);

    return new SwapKitNumber({ decimal, value, bigIntValue: result });
  }

  #setValue(value: AllowedValueType, bigIntValue?: bigint) {
    const rawValue = this.#toRawValue(value);
    const safeValue = this.#toSafeValue(value);

    this.value = !rawValue || isNaN(rawValue) ? 0 : rawValue;
    this.safeValue = !safeValue ? '0' : safeValue;
    this.bigIntValue = bigIntValue || this.#toBigInt(this.safeValue);
  }

  #getBigIntValue(value: SwapKitValueType, decimal?: number) {
    if (value instanceof SwapKitNumber) {
      return value.bigIntValue;
    }

    // TODO (@Chillios): Check if that doesn't lose precision
    return this.#toBigInt(this.#toSafeValue(value), decimal);
  }

  #retrieveSingleDecimal(...args: (SwapKitNumber | AllowedValueType)[]) {
    const decimals = args
      .map((arg) => (arg instanceof SwapKitNumber ? arg.decimal : undefined))
      .filter(Boolean) as number[];

    if (new Set(decimals).size > 1) {
      throw new SwapKitError('helpers_number_different_decimals');
    }

    return decimals[0] || DEFAULT_DECIMAL;
  }

  /**
   * Formatters
   */
  #toRawValue(value: AllowedValueType) {
    return parseFloat(this.#toSafeValue(value));
  }

  #toSafeValue(value: AllowedValueType) {
    const splitValue = `${value}`.replaceAll(',', '.').split('.');

    return splitValue.length > 1
      ? `${splitValue.slice(0, -1).join('')}.${splitValue.at(-1)}`
      : splitValue[0];
  }

  #toBigInt(value: string, decimal?: number) {
    const multiplier =
      typeof decimal === 'number' ? 10 ** decimal : parseFloat(this.#decimalMultiplier.toString());

    return BigInt(
      this.#formatSafeValueToBigIntString(
        this.#toSafeValue(value.toString()),
        Math.log10(multiplier),
      ),
    );
    // return BigInt(Math.round(parseFloat(value.toString()) * multiplier));
  }

  //   #toNumber(value: AllowedValueType) {
  //     if (typeof value === 'bigint') return Number(BigInt.asIntN(64, value));
  //     if (typeof value === 'string') return this.#toRawValue(value);
  //     return value;
  //   }

  #formatToSafeValue(value: AllowedValueType, decimal?: number) {
    const stringResult = value.toString();
    const SKNDecimal = decimal || this.decimal;
    const decimalIndex = stringResult.length - SKNDecimal;
    return `${stringResult.slice(0, decimalIndex)}.${stringResult.slice(-SKNDecimal)}`.replace(
      /\.?0*$/,
      '',
    );
  }

  #formatSafeValueToBigIntString(value: string, decimal?: number) {
    const numberParts = value.split('.');
    const SKNDecimal = decimal || this.decimal;
    const integerPart = numberParts[0];
    const decimalPart = (numberParts[1] || '').padEnd(SKNDecimal, '0');

    return `${integerPart}${decimalPart}`;
  }
}
