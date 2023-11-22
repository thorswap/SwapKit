import { BaseDecimal } from '@swapkit/types';

import type { SwapKitNumber } from './swapKitNumber.ts';

type NumberPrimitivesType = {
  bigint: bigint;
  number: number;
  string: string;
};
export type NumberPrimitives = bigint | number | string;
type InitialisationValueType = NumberPrimitives | BigIntArithmetics | SwapKitNumber;

type SKBigIntParams = InitialisationValueType | { decimal?: number; value: number | string };

const DEFAULT_DECIMAL = 8;
const toMultiplier = (decimal: number) => 10n ** BigInt(decimal);
const decimalFromMultiplier = (multiplier: bigint) => Math.log10(parseFloat(multiplier.toString()));

export function formatBigIntToSafeValue({
  value,
  bigIntDecimal = DEFAULT_DECIMAL,
  decimal = DEFAULT_DECIMAL,
}: {
  value: bigint;
  bigIntDecimal?: number;
  decimal?: number;
}) {
  const isNegative = value < 0n;
  let valueString = value.toString().substring(isNegative ? 1 : 0);

  const padLength = decimal - (valueString.length - 1);

  if (padLength > 0) {
    valueString = '0'.repeat(padLength) + valueString;
  }

  const decimalIndex = valueString.length - decimal;
  let decimalString = valueString.slice(-decimal);

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
    value: InstanceType<typeof SwapKitNumber>;
    from: number;
    to: number;
  }) {
    return this.fromBigInt(
      (value.getBaseValue('bigint') * toMultiplier(to)) / toMultiplier(from),
      to,
    );
  }

  constructor(params: SKBigIntParams) {
    const value = getStringValue(params);
    this.decimal = typeof params === 'object' ? params.decimal : undefined;

    // use the multiplier to keep track of decimal point - defaults to 8 if lower than 8
    this.decimalMultiplier = toMultiplier(
      Math.max(getFloatDecimals(toSafeValue(value)), this.decimal || 0),
    );
    this.#setValue(value);
  }

  set(value: SKBigIntParams): this {
    // @ts-expect-error False positive
    return new this.constructor({ decimal: this.decimal, value, identifier: this.toString() });
  }
  add(...args: InitialisationValueType[]) {
    return this.#arithmetics('add', ...args);
  }
  sub(...args: InitialisationValueType[]) {
    return this.#arithmetics('sub', ...args);
  }
  mul(...args: InitialisationValueType[]) {
    return this.#arithmetics('mul', ...args);
  }
  div(...args: InitialisationValueType[]) {
    return this.#arithmetics('div', ...args);
  }
  gt(value: InitialisationValueType) {
    return this.bigIntValue > this.getBigIntValue(value);
  }
  gte(value: InitialisationValueType) {
    return this.bigIntValue >= this.getBigIntValue(value);
  }
  lt(value: InitialisationValueType) {
    return this.bigIntValue < this.getBigIntValue(value);
  }
  lte(value: InitialisationValueType) {
    return this.bigIntValue <= this.getBigIntValue(value);
  }
  eqValue(value: InitialisationValueType) {
    return this.bigIntValue === this.getBigIntValue(value);
  }

  getValue<T extends 'number' | 'string'>(type: T): NumberPrimitivesType[T] {
    const value = this.formatBigIntToSafeValue(
      this.bigIntValue,
      this.decimal || decimalFromMultiplier(this.decimalMultiplier),
    );

    switch (type) {
      case 'number':
        // @ts-expect-error False positive
        return Number(value);
      case 'string':
        // @ts-expect-error False positive
        return value;
      default:
        // @ts-expect-error False positive
        return (this.bigIntValue * BigInt(this.decimal || 8n)) / this.decimalMultiplier;
    }
  }

  getBaseValue<T extends 'number' | 'string' | 'bigint'>(type: T): NumberPrimitivesType[T] {
    const divisor = this.decimalMultiplier / toMultiplier(this.decimal || BaseDecimal.THOR);
    const baseValue = this.bigIntValue / divisor;

    switch (type) {
      case 'number':
        // @ts-expect-error False positive
        return Number(baseValue);
      case 'string':
        // @ts-expect-error False positive
        return baseValue.toString();
      default:
        // @ts-expect-error False positive
        return baseValue;
    }
  }

  getBigIntValue(value: InitialisationValueType, decimal?: number) {
    if (!decimal && typeof value === 'object') return value.bigIntValue;

    const stringValue = getStringValue(value);
    const safeValue = toSafeValue(stringValue);

    if (safeValue === '0' || safeValue === 'undefined') return 0n;
    return this.#toBigInt(safeValue, decimal);
  }

  formatBigIntToSafeValue(value: bigint, decimal?: number) {
    const bigIntDecimal = decimal || this.decimal || DEFAULT_DECIMAL;
    const decimalToUseForConversion = Math.max(
      bigIntDecimal,
      decimalFromMultiplier(this.decimalMultiplier),
    );
    const isNegative = value < 0n;

    const valueString = value.toString().substring(isNegative ? 1 : 0);
    const padLength = decimalToUseForConversion - (valueString.length - 1);

    const parsedValueString = padLength > 0 ? '0'.repeat(padLength) + valueString : valueString;

    const decimalIndex = parsedValueString.length - decimalToUseForConversion;
    let decimalString = parsedValueString.slice(-decimalToUseForConversion);

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

    return `${isNegative ? '-' : ''}${parsedValueString.slice(
      0,
      decimalIndex,
    )}.${decimalString}`.replace(/\.?0*$/, '');
  }

  toSignificant(significantDigits: number = 6) {
    const [int, dec] = this.getValue('string').split('.');
    const integer = int || '';
    const decimal = dec || '';
    const valueLength = parseInt(integer) ? integer.length + decimal.length : decimal.length;

    if (valueLength <= significantDigits) {
      return this.getValue('string');
    }

    if (integer.length >= significantDigits) {
      return integer.slice(0, significantDigits).padEnd(integer.length, '0');
    }

    if (parseInt(integer)) {
      return `${integer}.${decimal.slice(0, significantDigits - integer.length)}`.padEnd(
        significantDigits - integer.length,
        '0',
      );
    }

    const trimmedDecimal = parseInt(decimal);
    const slicedDecimal = `${trimmedDecimal}`.slice(0, significantDigits);

    return `0.${slicedDecimal.padStart(
      decimal.length - `${trimmedDecimal}`.length + slicedDecimal.length,
      '0',
    )}`;
  }

  toFixed(fixedDigits: number = 6) {
    const [int, dec] = this.getValue('string').split('.');
    const integer = int || '';
    const decimal = dec || '';

    if (parseInt(integer)) {
      return `${integer}.${decimal.slice(0, fixedDigits)}`.padEnd(fixedDigits, '0');
    }

    const trimmedDecimal = parseInt(decimal);
    const slicedDecimal = `${trimmedDecimal}`.slice(0, fixedDigits);

    return `0.${slicedDecimal.padStart(
      decimal.length - `${trimmedDecimal}`.length + slicedDecimal.length,
      '0',
    )}`;
  }

  toAbbreviation(digits = 2) {
    const value = this.getValue('number');
    const abbreviations = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'S'];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
    const suffix = abbreviations[tier];

    if (!suffix) return this.getValue('string');

    const scale = 10 ** (tier * 3);
    const scaled = value / scale;

    return `${scaled.toFixed(digits)}${suffix}`;
  }

  toCurrency(
    currency = '$',
    {
      currencyPosition = 'start',
      decimal = 2,
      decimalSeparator = '.',
      thousandSeparator = ',',
    } = {},
  ) {
    const value = this.getValue('number');
    const [int, dec = ''] = value.toFixed(6).split('.');
    const integer = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    const parsedValue =
      !int && !dec
        ? '0.00'
        : int === '0'
        ? `${parseFloat(`0.${dec}`)}`.replace('.', decimalSeparator)
        : `${integer}${parseInt(dec) ? `${decimalSeparator}${dec.slice(0, decimal)}` : ''}`;

    return `${currencyPosition === 'start' ? currency : ''}${parsedValue}${
      currencyPosition === 'end' ? currency : ''
    }`;
  }

  #arithmetics(method: 'add' | 'sub' | 'mul' | 'div', ...args: InitialisationValueType[]): this {
    const precisionDecimal = this.#retrievePrecisionDecimal(this, ...args);
    const precisionDecimalMultiplier = toMultiplier(precisionDecimal);

    const result = args.reduce(
      (acc: bigint, arg) => {
        const value = this.getBigIntValue(arg, precisionDecimal);

        switch (method) {
          case 'add':
            return acc + value;
          case 'sub':
            return acc - value;
          /**
           * Multiplication & division would end up with wrong result if we don't adjust the value
           * 200000000n * 200000000n => 40000000000000000n
           * 200000000n / 200000000n => 1n
           * So we do the following:
           * 200000000n * 200000000n = 40000000000000000n / 100000000n (decimals) => 400000000n
           * (200000000n * 100000000n (decimals)) / 200000000n => 100000000n
           */
          case 'mul':
            return (acc * value) / precisionDecimalMultiplier;
          case 'div': {
            if (value === 0n) throw new RangeError('Division by zero');
            return (acc * precisionDecimalMultiplier) / value;
          }
          default:
            return acc;
        }
      },
      //normalize is to precision multiplier base
      (this.bigIntValue * precisionDecimalMultiplier) / this.decimalMultiplier,
    );

    const value = formatBigIntToSafeValue({
      bigIntDecimal: precisionDecimal,
      decimal: Math.max(precisionDecimal, decimalFromMultiplier(this.decimalMultiplier)),
      value: result,
    });

    // @ts-expect-error False positive
    return new this.constructor({ decimal: this.decimal, value, identifier: this.toString() });
  }

  #setValue(value: InitialisationValueType) {
    const safeValue = toSafeValue(value) || '0';
    this.bigIntValue = this.#toBigInt(safeValue);
  }

  #retrievePrecisionDecimal(...args: InitialisationValueType[]) {
    const decimals = args
      .map((arg) =>
        typeof arg === 'object'
          ? arg.decimal || decimalFromMultiplier(arg.decimalMultiplier)
          : getFloatDecimals(toSafeValue(arg)),
      )
      .filter(Boolean) as number[];
    return Math.max(...decimals, DEFAULT_DECIMAL);
  }

  #toBigInt(value: string, decimal?: number) {
    const multiplier = decimal ? toMultiplier(decimal) : this.decimalMultiplier;
    const padDecimal = decimalFromMultiplier(multiplier);
    const [integerPart = '', decimalPart = ''] = value.split('.');

    return BigInt(`${integerPart}${decimalPart.padEnd(padDecimal, '0')}`);
  }
}

const numberFormatter = Intl.NumberFormat('fullwide', {
  useGrouping: false,
  maximumFractionDigits: 20,
});

function toSafeValue(value: InitialisationValueType) {
  const parsedValue =
    typeof value === 'number' ? numberFormatter.format(value) : getStringValue(value);
  const splitValue = `${parsedValue}`.replaceAll(',', '.').split('.');

  return splitValue.length > 1
    ? `${splitValue.slice(0, -1).join('')}.${splitValue.at(-1)}`
    : splitValue[0];
}

function getFloatDecimals(value: string) {
  const decimals = value.split('.')[1]?.length || 0;
  return Math.max(decimals, DEFAULT_DECIMAL);
}

function getStringValue(param: SKBigIntParams) {
  return typeof param === 'object'
    ? 'getValue' in param
      ? param.getValue('string')
      : param.value
    : param;
}
