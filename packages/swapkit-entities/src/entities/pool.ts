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
  poolAPY: string;
  runeDepth: string;
  status: string;
  synthSupply: string;
  synthUnits: string;
  units: string;
  volume24h: string;
}

export interface IPool {
  readonly asset: Asset;
  readonly runeDepth: Amount;
  readonly assetDepth: Amount;
  readonly assetUSDPrice: Amount;

  readonly detail: PoolDetail;

  assetPriceInRune: Amount;
  runePriceInAsset: Amount;
  involvesAsset(asset: Asset): boolean;
  priceOf(asset: Asset): Amount;
  depthOf(asset: Asset): Amount;
}

export class Pool implements IPool {
  public readonly asset: Asset;
  public readonly runeDepth: Amount;
  public readonly assetDepth: Amount;
  public readonly assetUSDPrice: Amount;
  public readonly detail: PoolDetail;

  public static byAsset(asset: Asset, pools: Pool[]) {
    return !asset.isRUNE() ? pools.find((pool: Pool) => asset.shallowEq(pool.asset)) : undefined;
  }

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

  involvesAsset(asset: Asset) {
    return asset.isRUNE() || this.asset.shallowEq(asset);
  }

  priceOf(asset: Asset) {
    if (!this.involvesAsset(asset)) throw new Error('Invalid asset');

    if (asset.isRUNE()) return this.runePriceInAsset;
    return this.assetPriceInRune;
  }

  depthOf(asset: Asset) {
    if (!this.involvesAsset(asset)) throw new Error('Invalid asset');

    if (asset.isRUNE()) return this.runeDepth;
    return this.assetDepth;
  }
}
