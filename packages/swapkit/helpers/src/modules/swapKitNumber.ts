import { BigIntArithmetics } from './bigIntArithmetics.ts';

export type SwapKitValueType = BigIntArithmetics | string | number;

export class SwapKitNumber extends BigIntArithmetics {
  eq(value: SwapKitValueType) {
    return this.eqValue(value);
  }
}
