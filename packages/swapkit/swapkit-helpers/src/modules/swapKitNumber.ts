import { BaseSwapKitNumber } from './baseNumber.ts';

export type SwapKitValueType = BaseSwapKitNumber | string | number;

export class SwapKitNumber extends BaseSwapKitNumber {
  eq(value: SwapKitValueType) {
    return this.bigIntValue === this.getBigIntValue(value);
  }

  toString() {
    return this.value;
  }
}
