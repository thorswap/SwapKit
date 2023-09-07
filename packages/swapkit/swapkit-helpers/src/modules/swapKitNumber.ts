import { SwapKitError } from './swapKitError.ts';

type SwapKitValueType = bigint | number | string;

type Params = string | number | { decimal?: number; value: number | string; bigIntValue?: bigint };

const DEFAULT_DECIMAL = 8;

export class SwapKitNumber {
  #decimalMultiplier: bigint = 10n ** 8n;
  bigIntValue: bigint = 0n;
  decimal?: number;
  value: number = 0;

  constructor(valueOrParams: Params) {
    const complexInit = typeof valueOrParams === 'object';
    const value = complexInit ? valueOrParams.value : valueOrParams;

    this.decimal = complexInit ? valueOrParams.decimal : undefined;
    this.#decimalMultiplier = this.decimal ? 10n ** BigInt(this.decimal) : this.#decimalMultiplier;
    this.#setValue(value, complexInit ? valueOrParams.bigIntValue : undefined);
  }

  add(...args: (SwapKitNumber | string | number)[]) {
    return this.#arithmetics('add', ...args);
  }
  sub(...args: (SwapKitNumber | string | number)[]) {
    return this.#arithmetics('sub', ...args);
  }
  mul(...args: (SwapKitNumber | string | number)[]) {
    return this.#arithmetics('mul', ...args);
  }
  div(...args: (SwapKitNumber | string | number)[]) {
    return this.#arithmetics('div', ...args);
  }

  /**
   * Private methods
   */
  #arithmetics(
    method: 'add' | 'sub' | 'mul' | 'div',
    ...args: (SwapKitNumber | string | number)[]
  ) {
    const decimal = this.#ensureSameDecimal(this, ...args);

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
       * 200000000n * 200000000n = 40000000000000000n / 200000000n => 200000000n
       * 200000000n / 200000000n = 1n * 100000000n => 100000000n
       */
      if ('mul' === method) return (acc * value) / this.#decimalMultiplier;
      // 'div' === method
      return (acc / value) * this.#decimalMultiplier;
    }, this.bigIntValue);

    const value = this.#toNumber(result) / this.#toNumber(this.#decimalMultiplier);

    return new SwapKitNumber({ decimal, value, bigIntValue: result });
  }

  #setValue(value: SwapKitValueType, bigIntValue?: bigint) {
    const rawValue = this.#toRawValue(value);

    this.value = !rawValue || isNaN(rawValue) ? 0 : rawValue;
    this.bigIntValue = bigIntValue || this.#toBigInt(this.value);
  }

  #ensureSameDecimal(...args: (SwapKitNumber | SwapKitValueType)[]) {
    const decimals = args
      .map((arg) => (arg instanceof SwapKitNumber ? arg.decimal : undefined))
      .filter(Boolean) as number[];

    if (new Set(decimals).size > 1) {
      throw new SwapKitError('helpers_number_different_decimals');
    }

    return decimals[0] || DEFAULT_DECIMAL;
  }

  #getBigIntValue(value: number | string | SwapKitNumber, decimal?: number) {
    if (value instanceof SwapKitNumber) {
      return value.bigIntValue;
    }

    // TODO (@Chillios): Check if that doesn't lose precision
    return this.#toBigInt(this.#toRawValue(value), decimal);
  }

  /**
   * Formatters
   */
  #toRawValue(value: SwapKitValueType) {
    const splitValue = `${value}`.replaceAll(',', '.').split('.');

    return parseFloat(
      splitValue.length > 1
        ? `${splitValue.slice(0, -1).join('')}.${splitValue.at(-1)}`
        : splitValue[0],
    );
  }

  #toBigInt(value: bigint | number, decimal?: number) {
    const multiplier =
      typeof decimal === 'number' ? 10 ** decimal : parseFloat(this.#decimalMultiplier.toString());

    return BigInt(Math.round(parseFloat(value.toString()) * multiplier));
  }

  #toNumber(value: bigint | number | string) {
    if (typeof value === 'bigint') return Number(BigInt.asUintN(64, value));
    if (typeof value === 'string') return this.#toRawValue(value);
    return value;
  }
}
