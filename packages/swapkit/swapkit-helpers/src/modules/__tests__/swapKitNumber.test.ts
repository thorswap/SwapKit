import { describe, expect, test } from 'vitest';

import { SwapKitNumber } from '../swapKitNumber.ts';

describe('SwapKitNumber', () => {
  describe('create', () => {
    test('creates numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(1);
      const skNumber2 = new SwapKitNumber('1');
      const skNumber4 = new SwapKitNumber(0.000000001);
      const skNumber3 = new SwapKitNumber('0.000000001');
      expect(skNumber1.value).toBe(1);
      expect(skNumber2.value).toBe(1);
      expect(skNumber3.safeValue).toBe('0.000000001');
      expect(skNumber4.safeValue).toBe('0.000000001');
      expect(skNumber1.bigIntValue).toBe(100000000n);
      expect(skNumber2.bigIntValue).toBe(100000000n);
      expect(skNumber3.bigIntValue).toBe(1n);
      expect(skNumber4.bigIntValue).toBe(1n);
    });
  });

  describe('add', () => {
    test('adds same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber('0.5');
      const result = skNumber1.add(skNumber2, skNumber3);
      expect(result.value).toBe(15.5);
      expect(result.bigIntValue).toBe(1550000000n);
    });

    test('adds different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.add(6, '0.5');
      expect(result.value).toBe(16.5);
      expect(result.bigIntValue).toBe(1650000000n);
    });
  });

  describe('sub', () => {
    test('subtracts same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.sub(skNumber2, skNumber3);
      expect(result.value).toBe(4.5);
      expect(result.bigIntValue).toBe(450000000n);
    });

    test('subtracts different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.sub(6, '0.5');
      expect(result.value).toBe(3.5);
      expect(result.bigIntValue).toBe(350000000n);
    });

    test('can process negative results', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result0 = skNumber1.sub(10);
      const resultMinus = result0.sub('10');
      expect(result0.value).toBe(0);
      expect(resultMinus.value).toBe(-10);
      expect(result0.bigIntValue).toBe(0n);
      expect(resultMinus.bigIntValue).toBe(-1000000000n);
    });
  });

  describe('mul', () => {
    test('multiplies same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.mul(skNumber2, skNumber3);
      expect(result.value).toBe(25);
      expect(result.bigIntValue).toBe(2500000000n);
    });

    test('multiplies different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const result = skNumber1.mul(6, '0.5');
      expect(result.value).toBe(30);
      expect(result.bigIntValue).toBe(3000000000n);
    });

    test('multiplies numbers correctly if decimals of SKN is lower than number multiplied with', () => {
      const skNumber1 = new SwapKitNumber({ value: 1000000, decimal: 4 });
      const result = skNumber1.mul('0.00001');
      expect(result.value).toBe(10);
      expect(result.bigIntValue).toBe(1000000000n);
    });
  });

  describe('div', () => {
    test('divides same type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      const skNumber3 = new SwapKitNumber(0.5);
      const result = skNumber1.div(skNumber2, skNumber3);
      expect(result.value).toBe(4);
      expect(result.bigIntValue).toBe(400000000n);

      const skNumber4 = new SwapKitNumber(10.12);
      const result2 = skNumber4.div(0.0001);
      expect(result2.value).toBe(101200);
      expect(result2.bigIntValue).toBe(10120000000000n);
    });

    test('divides different type numbers correctly', () => {
      const skNumber1 = new SwapKitNumber(20);
      const result = skNumber1.div(5, '0.5');
      expect(result.value).toBe(8);
      expect(result.bigIntValue).toBe(800000000n);
    });

    test('divides different type numbers correctly when decimal is set', () => {
      const skNumber1 = new SwapKitNumber({ value: '1.2', decimal: 2 });
      const result = skNumber1.div(0.001);
      expect(result.value).toBe(1200);
      expect(result.bigIntValue).toBe(120000000000n);
    });

    test('divides smaller number by larger number', () => {
      const skNumber1 = new SwapKitNumber(1);
      const result = skNumber1.div(2);
      expect(result.value).toBe(0.5);
      expect(result.bigIntValue).toBe(50000000n);
    });
  });

  describe('gt', () => {
    test('greater than', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      expect(skNumber1.gt(skNumber2)).toBe(true);
      expect(skNumber2.gt(skNumber1)).toBe(false);
    });
  });

  describe('gte', () => {
    test('greater than or equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      expect(skNumber1.gte(skNumber2)).toBe(true);
      expect(skNumber1.gte(skNumber1)).toBe(true);
      expect(skNumber2.gte(skNumber1)).toBe(false);
    });
  });

  describe('lt', () => {
    test('less than', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      expect(skNumber1.lt(skNumber2)).toBe(false);
      expect(skNumber2.lt(skNumber1)).toBe(true);
    });
  });

  describe('lte', () => {
    test('less than or equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      expect(skNumber1.lte(skNumber2)).toBe(false);
      expect(skNumber1.lte(skNumber1)).toBe(true);
      expect(skNumber2.lte(skNumber1)).toBe(true);
    });
  });

  describe('eq', () => {
    test('equal', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('5');
      expect(skNumber1.eq(skNumber2)).toBe(false);
      expect(skNumber1.eq(skNumber1)).toBe(true);
      expect(skNumber2.eq(skNumber1)).toBe(false);
    });
  });

  describe('Throws', () => {
    test('throws if division by zero', () => {
      const skNumber1 = new SwapKitNumber(10);
      const skNumber2 = new SwapKitNumber('0');
      expect(() => skNumber1.div(skNumber2)).toThrow(RangeError);
      expect(() => skNumber1.div(0)).toThrow(RangeError);
    });
  });
});
