import { BigNumber } from 'bignumber.js';

import { BN_FORMAT } from '../helpers/asset.js';

import { Amount, AmountType, Rounding } from './amount.js';
import { AssetEntity as Asset, AssetEntity } from './asset.js';
import { Pool } from './pool.js';

const poolByAsset = (asset: AssetEntity, pools: Pool[]) =>
  pools.find((pool) => asset.shallowEq(pool.asset));

export class Price extends Amount {
  public readonly baseAsset: Asset;

  public readonly quoteAsset?: Asset;

  public readonly unitPrice: BigNumber;

  public readonly price: BigNumber;

  public readonly amount: Amount;

  constructor({
    baseAsset,
    quoteAsset,
    unitPrice,
    pools,
    priceAmount,
  }: {
    baseAsset: Asset;
    quoteAsset?: Asset;
    unitPrice?: BigNumber;
    pools?: Pool[];
    priceAmount?: Amount;
  }) {
    const amount = Amount.fromAssetAmount(
      priceAmount ? priceAmount.assetAmount : 1,
      baseAsset.decimal,
    );

    super(amount.assetAmount, AmountType.ASSET_AMOUNT, baseAsset.decimal);

    this.amount = amount;
    this.baseAsset = baseAsset;
    this.quoteAsset = quoteAsset;

    if (unitPrice !== undefined) {
      this.unitPrice = unitPrice;
      this.price = amount.assetAmount.multipliedBy(unitPrice);
    } else {
      if (!pools) throw new Error('Pools must be provided if unitPrice omitted');

      this.unitPrice = new BigNumber(0);

      // if quoteAsset is not specified OR is USD, calc the price for USD
      if (!quoteAsset) {
        if (!baseAsset.isRUNE()) {
          const pool = poolByAsset(baseAsset, pools!);

          if (pool) {
            // set USD price for non-RUNE asset
            this.unitPrice = pool.assetUSDPrice.assetAmount;
          }
        } else {
          const pool = pools?.[0];
          // set USD Price of RUNE
          if (pool) {
            this.unitPrice = pool.runePriceInAsset.mul(pool.assetUSDPrice).assetAmount;
          }
        }
      } else if (baseAsset.isRUNE() && !quoteAsset.isRUNE()) {
        const pool = poolByAsset(quoteAsset, pools!);

        if (pool) {
          this.unitPrice = pool.runePriceInAsset.assetAmount;
        }
      } else if (!baseAsset.isRUNE() && quoteAsset.isRUNE()) {
        const pool = poolByAsset(baseAsset, pools!);

        if (pool) {
          this.unitPrice = pool.assetPriceInRune.assetAmount;
        }
      } else if (!baseAsset.isRUNE() && !quoteAsset.isRUNE()) {
        const baseAssetPool = poolByAsset(baseAsset, pools!);
        const quoteAssetPool = poolByAsset(quoteAsset, pools!);

        if (baseAssetPool && quoteAssetPool) {
          this.unitPrice = baseAssetPool.assetPriceInRune.div(
            quoteAssetPool.assetPriceInRune,
          ).assetAmount;
        }
      } else {
        // both are RUNE
        this.unitPrice = new BigNumber(1);
      }

      this.price = this.unitPrice.multipliedBy(amount.assetAmount);
    }
  }

  raw() {
    return this.price;
  }

  invert() {
    return new BigNumber(1).dividedBy(this.raw());
  }

  toCurrencyFormat(decimalPlaces = 8, abbreviate = true) {
    const fixedLabel = abbreviate
      ? this.toAbbreviateRaw(decimalPlaces)
      : this.toFixedRaw(decimalPlaces);

    const isUSDBased = !this.quoteAsset || this.quoteAsset.ticker === 'USD';

    return isUSDBased ? `$${fixedLabel}` : `${fixedLabel} ${this.quoteAsset?.ticker}`;
  }

  toAbbreviateRaw(decimalPlaces = 2) {
    return Amount.fromAssetAmount(this.price, 8).toAbbreviate(decimalPlaces);
  }

  toFixedRaw(
    decimalPlaces = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return Amount.fromAssetAmount(this.price, 8).toFixed(decimalPlaces, format, rounding);
  }

  toFixedInverted(
    decimalPlaces = 8,
    format: BigNumber.Format = BN_FORMAT,
    rounding: Rounding = Rounding.ROUND_DOWN,
  ) {
    return Amount.fromAssetAmount(this.invert(), 8).toFixed(decimalPlaces, format, rounding);
  }
}
