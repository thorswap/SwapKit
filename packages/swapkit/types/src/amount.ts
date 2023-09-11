export type SwapkitNumberParams = string | number | { decimal?: number; value: number | string };
export type SwapKitValueType = SwapKitNumber | string | number;

export interface SwapKitNumber {
  decimalMultiplier: bigint;
  bigIntValue: bigint;
  decimal?: number;
  unsafeNumber: number;
  value: string;
  constructor: (valueOrParams: SwapkitNumberParams) => SwapKitNumber;
  add: (...args: SwapKitValueType[]) => SwapKitNumber;
  sub: (...args: SwapKitValueType[]) => SwapKitNumber;
  mul: (...args: SwapKitValueType[]) => SwapKitNumber;
  div: (...args: SwapKitValueType[]) => SwapKitNumber;
  gt: (value: SwapKitValueType) => boolean;
  gte: (value: SwapKitValueType) => boolean;
  lt: (value: SwapKitValueType) => boolean;
  lte: (value: SwapKitValueType) => boolean;
  eq: (value: SwapKitValueType) => boolean;
  getBigIntValue: (value: SwapKitValueType, decimal?: number) => bigint;
  formatBigIntToSafeValue: (value: bigint, decimal?: number) => string;
}
