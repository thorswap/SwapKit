import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import {
  AmountWithAssetDenom,
  AmountWithBaseDenom,
  Chain,
  Denomination,
  FixedNumberish,
} from '@thorswap-lib/types';

import { fixedBN, fixedNumber, isFixedNumberValue } from './bigNumber.js';

export const assetAmount = (
  value: FixedNumberish | undefined,
  decimal: number = 8,
): AmountWithAssetDenom => {
  const amount = fixedNumber(value, decimal);
  return {
    type: Denomination.Asset,
    amount: () => amount,
    plus: (v: FixedNumberish | AmountWithAssetDenom, d: number = decimal) =>
      assetAmount(
        fixedBN(
          parseFixed(amount.toString(), d).add(
            parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
          ),
          d,
        ),
        d,
      ),
    minus: (v: FixedNumberish | AmountWithAssetDenom, d: number = decimal) =>
      assetAmount(
        fixedBN(
          parseFixed(amount.toString(), d).sub(
            parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
          ),
          d,
        ),
        d,
      ),
    times: (v: FixedNumberish | AmountWithAssetDenom, d: number = decimal) =>
      assetAmount(
        fixedBN(
          parseFixed(amount.toString(), d).mul(
            parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
          ),
          d,
        ),
        d,
      ),
    div: (v: FixedNumberish | AmountWithAssetDenom, d: number = decimal) =>
      assetAmount(
        fixedBN(
          parseFixed(amount.toString(), d).div(
            parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
          ),
          d,
        ),
        d,
      ),
    lt: (v: FixedNumberish | AmountWithAssetDenom) =>
      parseFixed(amount.toString(), decimal).lt(
        parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
      ),
    lte: (v: FixedNumberish | AmountWithAssetDenom) =>
      parseFixed(amount.toString(), decimal).lte(
        parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
      ),
    gt: (v: FixedNumberish | AmountWithAssetDenom) =>
      parseFixed(amount.toString(), decimal).gt(
        parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
      ),
    gte: (v: FixedNumberish | AmountWithAssetDenom) =>
      parseFixed(amount.toString(), decimal).gte(
        parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
      ),
    eq: (v: FixedNumberish | AmountWithAssetDenom) =>
      parseFixed(amount.toString(), decimal).eq(
        parseFixed((isFixedNumberValue(v) ? v : v.amount()).toString(), decimal),
      ),
    decimal,
  };
};

export const assetToString = ({ chain, symbol }: { chain: Chain; symbol: string }) =>
  `${chain}.${symbol}`;

export const baseToAsset = (base: AmountWithBaseDenom) => {
  const decimal = base.decimal;
  const value = formatFixed(base.amount());
  return assetAmount(value, decimal);
};

export const assetFromString = (assetString: string) => {
  const [chain, ...symbolArray] = assetString.split('.') as [Chain, ...(string | undefined)[]];
  const synth = assetString.includes('/');
  const symbol = symbolArray.join('.');
  const ticker = symbol?.split('-')?.[0];

  return { chain, symbol, ticker, synth };
};

export const createAssetObjFromAsset = (asset: {
  chain: Chain;
  isSynth: boolean;
  symbol: string;
}) =>
  assetFromString(
    asset.isSynth
      ? `${Chain.THORChain}.${asset.chain.toLowerCase()}/${asset.symbol.toLowerCase()}`
      : `${asset.chain.toUpperCase()}.${asset.symbol.toUpperCase()}`,
  );
