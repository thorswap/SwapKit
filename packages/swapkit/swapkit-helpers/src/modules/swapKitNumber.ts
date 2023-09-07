type AllowedValueType = bigint | number | string;
type ArithmeticMethod = 'add' | 'sub' | 'mul' | 'div';
type SwapKitValueType = BaseSwapKitNumber | string | number;

type Params = string | number | { decimal?: number; value: number | string; bigIntValue?: bigint };

const DEFAULT_DECIMAL = 8;

export class BaseSwapKitNumber {
  #decimalMultiplier: bigint = 10n ** 8n;
  bigIntValue: bigint = 0n;
  decimal?: number;
  value: number = 0;
  safeValue: string = '0';

  constructor(valueOrParams: Params) {
    const complexInit = typeof valueOrParams === 'object';
    const value = complexInit ? valueOrParams.value : valueOrParams;

    this.decimal = complexInit ? valueOrParams.decimal : undefined;
    // use the multiplier to keep track of decimal point - defaults to 8 if lower than 8
    this.#decimalMultiplier = 10n ** BigInt(this.#getFloatDecimals(this.#toSafeValue(value)));
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

  getBigIntValue(value: SwapKitValueType, decimal?: number) {
    if (typeof value === 'object') return value.bigIntValue;

    // TODO (@Chillios): Check if that doesn't lose precision
    return this.#toBigInt(this.#toSafeValue(value), decimal);
  }

  #arithmetics(method: ArithmeticMethod, ...args: SwapKitValueType[]) {
    const finalDecimal = Math.log10(parseFloat(this.#decimalMultiplier.toString()));
    const precisionDecimal = this.#retrievePrecisionDecimal(this, ...args);
    const precisionDecimalMultiplier = 10n ** BigInt(precisionDecimal);

    const result = args.reduce((acc, arg) => {
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
    }, this.bigIntValue);

    const value = this.#formatBigIntToSafeValue(result, finalDecimal);

    return new BaseSwapKitNumber({ decimal: precisionDecimal, value, bigIntValue: result });
  }

  #setValue(value: AllowedValueType, bigIntValue?: bigint) {
    const rawValue = this.#toRawValue(value);
    const safeValue = this.#toSafeValue(value) || '0';
    this.value = !rawValue || isNaN(rawValue) ? 0 : rawValue;
    this.safeValue = safeValue;
    this.bigIntValue = bigIntValue || this.#toBigInt(safeValue);
  }

  #retrievePrecisionDecimal(...args: (BaseSwapKitNumber | AllowedValueType)[]) {
    const decimals = args
      .map((arg) =>
        typeof arg === 'object' ? arg.decimal : this.#getFloatDecimals(this.#toSafeValue(arg)),
      )
      .filter(Boolean) as number[];
    return Math.max(...decimals, DEFAULT_DECIMAL);
  }

  #toRawValue(value: AllowedValueType) {
    return parseFloat(this.#toSafeValue(value));
  }

  #toBigInt(value: string, decimal?: number) {
    const multiplier =
      typeof decimal === 'number' ? 10 ** decimal : parseFloat(this.#decimalMultiplier.toString());

    return BigInt(this.#formatSafeValueToBigIntString(value, Math.log10(multiplier)));
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
    const stringResult = value.toString();
    const bigIntDecimal = this.#getDecimal(decimal);
    const decimalIndex = stringResult.length - bigIntDecimal;

    return `${stringResult.slice(0, decimalIndex)}.${stringResult.slice(-bigIntDecimal)}`.replace(
      /\.?0*$/,
      '',
    );
  }

  #formatSafeValueToBigIntString(value: string, decimal?: number) {
    const numberParts = value.split('.');
    const [integerPart, decimalPart = ''] = numberParts;

    return `${integerPart}${decimalPart.padEnd(this.#getDecimal(decimal), '0')}`;
  }

  #getDecimal(decimal?: number) {
    return decimal || this.decimal || DEFAULT_DECIMAL;
  }

  #getFloatDecimals(value: string) {
    const decimals = value.split('.')[1]?.length || 0;
    return Math.max(decimals, DEFAULT_DECIMAL);
  }
}

export class SwapKitNumber extends BaseSwapKitNumber {
  eq(value: SwapKitValueType) {
    return this.bigIntValue === this.getBigIntValue(value);
  }
}
