import { describe, expect, it } from 'vitest';

import { derivationPathToString, getTHORNameCost, validateTHORName } from '../others.ts';

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
