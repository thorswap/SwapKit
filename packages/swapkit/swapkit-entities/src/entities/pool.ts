import { BaseDecimal } from '@thorswap-lib/types';

import { Amount } from './amount.js';
import { AssetEntity as Asset } from './asset.js';

export interface PoolDetail {
  annualPercentageRate: string;
  asset: string;
  assetDepth: string;
  assetPrice: string;
  assetPriceUSD: string;
  liquidityUnits: string;
  loanCollateral: string;
  poolAPY: string;
  runeDepth: string;
  status: string;
  synthSupply: string;
  synthUnits: string;
  units: string;
  volume24h: string;
}

export class Pool {
  public readonly asset: Asset;
  public readonly runeDepth: Amount;
  public readonly assetDepth: Amount;
  public readonly assetUSDPrice: Amount;
  public readonly detail: PoolDetail;

  public static fromPoolData(poolDetail: PoolDetail) {
    const { asset, runeDepth, assetDepth } = poolDetail;
    const assetObj = Asset.fromAssetString(asset);

    if (assetObj && runeDepth && assetDepth) {
      const runeAmount = Amount.fromBaseAmount(runeDepth, BaseDecimal.THOR);
      const assetAmount = Amount.fromBaseAmount(assetDepth, BaseDecimal.THOR);

      return new Pool(assetObj, runeAmount, assetAmount, poolDetail);
    }

    return null;
  }

  constructor(asset: Asset, runeDepth: Amount, assetDepth: Amount, detail: PoolDetail) {
    this.asset = asset;
    this.runeDepth = runeDepth;
    this.assetDepth = assetDepth;
    this.detail = detail;

    this.assetUSDPrice = Amount.fromAssetAmount(detail.assetPriceUSD, BaseDecimal.THOR);
  }

  get assetPriceInRune() {
    return this.runeDepth.div(this.assetDepth);
  }

  get runePriceInAsset() {
    return this.assetDepth.div(this.runeDepth);
  }
}
