import { Chain } from '@thorswap-lib/types';
import { BigNumber } from 'bignumber.js';

import { BN_FORMAT } from '../constants.js';

import { Amount, AmountType, IAmount, Rounding } from './amount.js';
import { AssetEntity as Asset } from './asset.js';
import { Pool } from './pool.js';
import { Price } from './price.js';

export interface IAssetAmount extends IAmount {
  readonly asset: Asset;
  readonly amount: Amount;

  add(amount: AssetAmount): AssetAmount;
  sub(amount: AssetAmount): AssetAmount;
  mul(value: BigNumber.Value | Amount): AssetAmount;
  div(value: BigNumber.Value | Amount): AssetAmount;

  toCurrencyFormat(
    {
      significantDigits,
      format,
      rounding,
    }: {
      significantDigits?: number;
      format?: BigNumber.Format;
      rounding?: Rounding;
    },
    isPrefix?: boolean,
  ): string;
  unitPriceIn(asset: Asset, pools: Pool[]): Price;
  totalPriceIn(asset: Asset, pools: Pool[]): Price;
}

export class AssetAmount extends Amount implements IAssetAmount {
  public readonly asset: Asset;

  public readonly amount: Amount;

  /**
   * min send amount allowed for transaction to avoid dust attack
   * if the amount is smaller than min threshold amount, it will not be observed from bifrost
   * @param chain asset chain
   * @returns min amount
   */
  public static getMinAmountByChain(chain: Chain) {
    if (chain === Chain.Binance) {
      return new AssetAmount(Asset.BNB(), Amount.fromBaseAmount(1, Asset.BNB().decimal));
    }
    // 10001 satoshi
    if (chain === Chain.Bitcoin) {
      return new AssetAmount(Asset.BTC(), Amount.fromBaseAmount(10001, Asset.BTC().decimal));
    }
    // 10001 satoshi
    if (chain === Chain.Litecoin) {
      return new AssetAmount(Asset.LTC(), Amount.fromBaseAmount(10001, Asset.LTC().decimal));
    }
    // 10001 satoshi
    if (chain === Chain.BitcoinCash) {
      return new AssetAmount(Asset.BCH(), Amount.fromBaseAmount(10001, Asset.BCH().decimal));
    }
    // 1 doge
    if (chain === Chain.Doge) {
      return new AssetAmount(Asset.DOGE(), Amount.fromBaseAmount(100000001, Asset.DOGE().decimal));
    }
    // 0 Thor
    if (chain === Chain.THORChain) {
      return new AssetAmount(Asset.RUNE(), Amount.fromBaseAmount(0, Asset.RUNE().decimal));
    }
    // 10 gwei ETH
    if (chain === Chain.Ethereum) {
      return new AssetAmount(Asset.ETH(), Amount.fromBaseAmount(10 * 10 ** 9, Asset.ETH().decimal));
    }

    if (chain === Chain.Avalanche) {
      return new AssetAmount(
        Asset.AVAX(),
        Amount.fromBaseAmount(10 * 10 ** 9, Asset.ETH().decimal),
      );
    }

    if (chain === Chain.Cosmos) {
      return new AssetAmount(Asset.ATOM(), Amount.fromBaseAmount(1, Asset.ATOM().decimal));
    }

    return new AssetAmount(Asset.RUNE(), Amount.fromBaseAmount(1, Asset.RUNE().decimal));
  }

  /**
   * min threshold amount for gas purpose
   * @param chain name of asset chain
   * @returns min threshold amount to retain in the balance for gas purpose
   */
  public static getThresholdAmountByChain(chain: Chain) {
    if (chain === Chain.Binance) {
      return new AssetAmount(Asset.BNB(), Amount.fromAssetAmount(0, Asset.BNB().decimal));
    }

    if (chain === Chain.Bitcoin) {
      return new AssetAmount(Asset.BTC(), Amount.fromAssetAmount(0, Asset.BTC().decimal));
    }

    if (chain === Chain.THORChain) {
      return new AssetAmount(Asset.RUNE(), Amount.fromAssetAmount(1, Asset.RUNE().decimal));
    }

    if (chain === Chain.Ethereum) {
      return new AssetAmount(Asset.ETH(), Amount.fromAssetAmount(0, Asset.ETH().decimal));
    }

    if (chain === Chain.Avalanche) {
      return new AssetAmount(Asset.AVAX(), Amount.fromAssetAmount(0, Asset.AVAX().decimal));
    }

    if (chain === Chain.Litecoin) {
      return new AssetAmount(Asset.LTC(), Amount.fromAssetAmount(0, Asset.LTC().decimal));
    }

    if (chain === Chain.BitcoinCash) {
      return new AssetAmount(Asset.BCH(), Amount.fromAssetAmount(0, Asset.BCH().decimal));
    }

    if (chain === Chain.Doge) {
      return new AssetAmount(Asset.DOGE(), Amount.fromAssetAmount(0, Asset.DOGE().decimal));
    }

    if (chain === Chain.Cosmos) {
      return new AssetAmount(Asset.ATOM(), Amount.fromAssetAmount(0, Asset.ATOM().decimal));
    }

    return new AssetAmount(Asset.RUNE(), Amount.fromAssetAmount(1, Asset.RUNE().decimal));
  }

  /**
   * min threshold amount for gas purpose
   * @param chain name of asset chain
   * @returns min threshold amount to retain in the balance for gas purpose
   */
  public static getThresholdAmount = (asset: Asset) => {
    if (asset.isGasAsset()) {
      return AssetAmount.getThresholdAmountByChain(asset.chain);
    }

    return new AssetAmount(asset, Amount.fromAssetAmount(0, asset.decimal));
  };

  constructor(asset: Asset, amount: Amount) {
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
    const significantValue = super.toSignificant(significantDigits, format, rounding);

    if (isPrefix) {
      return `${this.asset.currencySymbol()} ${significantValue}`;
    }

    return `${significantValue} ${this.asset.currencySymbol()}`;
  }

  unitPriceIn(quoteAsset: Asset, pools: Pool[]) {
    return new Price({
      baseAsset: this.asset,
      quoteAsset,
      pools,
    });
  }

  totalPriceIn(quoteAsset: Asset, pools: Pool[]) {
    return new Price({
      baseAsset: this.asset,
      quoteAsset,
      pools,
      priceAmount: Amount.fromAssetAmount(this.assetAmount, this.decimal),
    });
  }
}
