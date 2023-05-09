import { Chain } from '@thorswap-lib/types';
import { BigNumber } from 'bignumber.js';

import { BN_FORMAT } from '../helpers/asset.js';

import { Amount, AmountType, Rounding } from './amount.js';
import { AssetEntity, getSignatureAssetFor } from './asset.js';
import { Pool } from './pool.js';
import { Price } from './price.js';

export class AssetAmount extends Amount {
  public readonly asset: AssetEntity;

  public readonly amount: Amount;

  constructor(asset: AssetEntity, amount: Amount) {
    super(amount.assetAmount, AmountType.ASSET_AMOUNT, asset.decimal);
    this.asset = asset;

    // make sure amount has same decimal as asset
    this.amount = new Amount(amount.assetAmount, AmountType.ASSET_AMOUNT, asset.decimal);
  }

  add(amount: AssetAmount) {
    if (!this.asset.shallowEq(amount.asset)) throw new Error('asset must be same');

    return new AssetAmount(this.asset, this.amount.add(amount.amount));
  }

  sub(amount: AssetAmount) {
    if (!this.asset.shallowEq(amount.asset)) throw new Error('asset must be same');

    return new AssetAmount(this.asset, this.amount.sub(amount.amount));
  }

  mul(value: BigNumber.Value | Amount) {
    let amount;
    if (value instanceof Amount) {
      amount = new Amount(
        this.assetAmount.multipliedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    } else {
      amount = new Amount(
        this.assetAmount.multipliedBy(value),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    }

    return new AssetAmount(this.asset, amount);
  }

  div(value: BigNumber.Value | Amount) {
    let amount;
    if (value instanceof Amount) {
      amount = new Amount(
        this.assetAmount.dividedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    } else {
      amount = new Amount(this.assetAmount.dividedBy(value), AmountType.ASSET_AMOUNT, this.decimal);
    }

    return new AssetAmount(this.asset, amount);
  }

  toCurrencyFormat(
    {
      significantDigits,
      format,
      rounding,
    }: {
      significantDigits?: number;
      format?: BigNumber.Format;
      rounding?: Rounding;
    } = {
      significantDigits: 6,
      format: BN_FORMAT,
      rounding: Rounding.ROUND_DOWN,
    },
    isPrefix = false,
  ) {
    const significantValue = super.toSignificant(significantDigits, 8, format, rounding);

    if (isPrefix) {
      return `${this.asset.ticker} ${significantValue}`;
    }

    return `${significantValue} ${this.asset.ticker}`;
  }

  totalPriceIn(quoteAsset: AssetEntity, pools: Pool[]) {
    return new Price({
      baseAsset: this.asset,
      quoteAsset,
      pools,
      priceAmount: Amount.fromAssetAmount(this.assetAmount, this.decimal),
    });
  }
}

export const getMinAmountByChain = (chain: Chain) => {
  const asset = getSignatureAssetFor(chain);
  const minAmount = [Chain.Bitcoin, Chain.Litecoin, Chain.BitcoinCash].includes(chain)
    ? // 10001 satoshi
      10001
    : [Chain.Doge].includes(chain)
    ? // 1 DOGE
      100000001
    : [Chain.Avalanche, Chain.Ethereum].includes(chain)
    ? //  10 gwei
      10 * 10 ** 9
    : chain === Chain.THORChain
    ? // 0 RUNE
      0
    : 1;

  return new AssetAmount(asset, Amount.fromBaseAmount(minAmount, asset.decimal));
};
