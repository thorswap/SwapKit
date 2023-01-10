import { describe, expect, it } from 'vitest';

import { getTHORNameCost, validateTHORName } from '../thorname.js';

describe('getTHORNameCost', () => {
  it.each([
    [1, 11],
    [2, 12],
    [3, 13],
    [10, 20],
  ])('returns correct cost for %d years', (years, expected) => {
    const result = getTHORNameCost(years);
    expect(result).toBe(expected);
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
