import { describe, expect, it } from 'vitest';

import { AssetValue, SwapKitNumber } from '../../index.ts';
import {
  assetValueFromMidgard,
  derivationPathToString,
  getTHORNameCost,
  swapKitNumberFromMidgard,
  toMidgardAmount,
  validateTHORName,
} from '../others.ts';

describe('derivationPathToString', () => {
  it('should return the correct string for a full path', () => {
    const path = [1, 2, 3, 4, 5];
    const result = derivationPathToString(path);
    expect(result).toEqual("1'/2'/3'/4/5");
  });

  it('should return the correct string for a short path', () => {
    const path = [1, 2, 3, 4];
    const result = derivationPathToString(path);
    expect(result).toEqual("1'/2'/3'/4");
  });
});

describe('getTHORNameCost', () => {
  describe('for correct values', () => {
    [
      [1, 11],
      [2, 12],
      [3, 13],
      [10, 20],
    ].forEach(([years, expected]) => {
      it(`returns correct ${expected} cost for ${years} years`, () => {
        const result = getTHORNameCost(years);
        expect(result).toBe(expected);
      });
    });
  });

  it('throws an error for negative years', () => {
    expect(() => getTHORNameCost(-1)).toThrowError('Invalid number of year');
  });
});

describe('validateTHORName', () => {
  const casesWithExpectation: [string, boolean][] = [
    ['validname', true],
    ['valid-name', true],
    ['valid_name', true],
    ['valid+name', true],
    ['name_with_numbers123', true],
    ['UPPER_CASE', true],
    ['toolongname123456789012345678901', false],
    ['invalid@name', false],
    ['invalid!name', false],
    ['invalid#name', false],
  ];

  casesWithExpectation.forEach(([name, expected]) => {
    it(`returns ${expected} for THORName "${name}"`, () => {
      const result = validateTHORName(name);
      expect(result).toBe(expected);
    });
  });
});

describe('swapKitNumberFromMidgard', () => {
  it('should create SwapKitNumber from string or number with 8 decimals', () => {
    const fromString = swapKitNumberFromMidgard('123456789');
    expect(fromString.getValue('string')).toBe('123456789');
    expect(fromString.decimal).toBe(8);

    const fromNumber = swapKitNumberFromMidgard(123456789);
    expect(fromNumber.getValue('string')).toBe('123456789');
    expect(fromNumber.decimal).toBe(8);
  });
});

describe('toMidgardAmount', () => {
  it('should convert SwapKitNumber or AssetValue to Midgard amount string', () => {
    const skNumber = new SwapKitNumber({ value: 123.456, decimal: 8 });
    const assetValue = AssetValue.fromStringSync('THOR.RUNE', 123.456);

    expect(toMidgardAmount(skNumber)).toBe('12345600000');
    expect(toMidgardAmount(assetValue)).toBe('12345600000');
  });
});

describe('assetValueFromMidgard', () => {
  it('should create AssetValue from Midgard asset and value', () => {
    const asset = 'THOR.RUNE';
    const value = '123456789';
    const result = assetValueFromMidgard(asset, value);

    expect(result instanceof AssetValue).toBe(true);
    expect(result.toUrl()).toBe('THOR.RUNE');
    expect(result.getValue('string')).toBe('123456789');
  });
});
