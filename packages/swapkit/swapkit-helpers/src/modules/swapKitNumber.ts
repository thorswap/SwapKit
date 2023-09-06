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
    const decimal = this.#ensureSameDecimal(...args);

    const sum = args.reduce(
      (acc, arg) => acc + this.#getBigIntValue(arg, decimal),
      this.bigIntValue,
    );
    const value = parseFloat(sum.toString()) / parseFloat(this.#decimalMultiplier.toString());

    return new SwapKitNumber({ decimal, value, bigIntValue: sum });
  }

  #getBigIntValue(value: number | string | SwapKitNumber, decimal?: number) {
    if (value instanceof SwapKitNumber) {
      return value.bigIntValue;
    }

    if (!decimal) throw new Error('Decimal is required to get value from number or string');

    // TODO (@Chillios): Check if that doesn't lose precision
    return this.#toBigInt(this.#getRawValue(value), decimal);
  }

  #setValue(value: SwapKitValueType, bigIntValue?: bigint) {
    const rawValue = this.#getRawValue(value);

    this.value = !rawValue || isNaN(rawValue) ? 0 : rawValue;
    this.bigIntValue = bigIntValue || this.#toBigInt(this.value);
  }

  #ensureSameDecimal(...args: (SwapKitNumber | SwapKitValueType)[]) {
    const decimals = args
      .map((arg) => (arg instanceof SwapKitNumber ? arg.decimal : undefined))
      .filter(Boolean) as number[];

    if (new Set(decimals).size > 1) {
      throw new Error('Cannot add numbers with different decimals');
    }

    return decimals[0] || DEFAULT_DECIMAL;
  }

  #getRawValue(value: SwapKitValueType) {
    const splitValue = `${value}`.replaceAll(',', '.').split('.');

    return parseFloat(
      splitValue.length > 1
        ? `${splitValue.slice(0, -1).join('')}.${splitValue.at(-1)}`
        : splitValue[0],
    );
  }

  #toBigInt(value: number, decimal?: number) {
    const multiplier = decimal ? 10 ** decimal : parseFloat(this.#decimalMultiplier.toString());
    return BigInt(Math.round(value * multiplier));
  }
}
