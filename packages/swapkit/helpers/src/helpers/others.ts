// 10 rune for register, 1 rune per year

import { AssetValue, BigIntArithmetics, SwapKitNumber } from '../index.ts';

// MINIMUM_REGISTRATION_FEE = 11
export function getTHORNameCost(year: number) {
  if (year < 0) throw new Error('Invalid number of year');
  return 10 + year;
}

export function validateTHORName(name: string) {
  if (name.length > 30) return false;

  const regex = /^[a-zA-Z0-9+_-]+$/g;

  return !!name.match(regex);
}

export function derivationPathToString([network, chainId, account, change, index]: number[]) {
  const shortPath = typeof index !== 'number';

  return `${network}'/${chainId}'/${account}'/${change}${shortPath ? '' : `/${index}`}`;
}

export function swapKitNumberFromMidgard(value: string | number) {
  return SwapKitNumber.fromBigInt(BigInt(value), 8);
}

export function toMidgardAmount(amount: SwapKitNumber | AssetValue) {
  return BigIntArithmetics.shiftDecimals({
    value: new SwapKitNumber(amount.getValue('string')),
    from: amount.decimal || 8,
    to: 8,
  }).getBaseValue('string');
}

export function assetValueFromMidgard(asset: string, value: string | number) {
  return AssetValue.fromStringSync(asset, swapKitNumberFromMidgard(value).getValue('string'));
}
