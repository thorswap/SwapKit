import { BaseDecimal } from '@thorswap-lib/types';

import { Amount } from './amount.js';
import { Percent } from './percent.js';
import { Pool } from './pool.js';

export type WithdrawAmount = {
  runeAmount: Amount;
  assetAmount: Amount;
};

export interface ILiquidity {
  readonly pool: Pool;
  readonly poolUnits: Amount;
  readonly liquidityUnits: Amount;

  poolShare: Percent;
  assetShare: Amount;
  runeShare: Amount;

  getLiquidityUnits(runeAddAmount: Amount, assetAddAmount: Amount): Amount;
  getLiquiditySlip(runeAddAmount: Amount, assetAddAmount: Amount): Percent;
  getSymWithdrawAmount(percent: Percent): WithdrawAmount;

  getAsymRuneShare(): Amount;
  getAsymAssetShare(): Amount;
  getAsymRuneWithdrawAmount(percent: Percent): Amount;
  getAsymAssetWithdrawAmount(percent: Percent): Amount;
}

export class Liquidity implements ILiquidity {
  public readonly pool: Pool;

  public readonly poolUnits: Amount;

  public readonly liquidityUnits: Amount;

  constructor(pool: Pool, liquidityUnits: Amount) {
    this.pool = pool;
    this.poolUnits = Amount.fromBaseAmount(pool.detail.units, BaseDecimal.THOR);
    this.liquidityUnits = liquidityUnits;
  }

  public get poolShare() {
    // formula: liquidity Units / total Units
    return new Percent(this.liquidityUnits.div(this.poolUnits).assetAmount);
  }

  public get assetShare() {
    // formula: Total Balance * liquidity Units / total Units
    return this.pool.assetDepth.mul(this.liquidityUnits).div(this.poolUnits);
  }

  public get runeShare() {
    // formula: Total Balance * liquidity Units / total Units
    return this.pool.runeDepth.mul(this.liquidityUnits).div(this.poolUnits);
  }

  /**
   * get estimated pool share after adding a liquidity
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   * @returns percent object for estimated pool share
   */
  getPoolShareEst(runeAddAmount: Amount, assetAddAmount: Amount) {
    // get LP units after add
    const estimatedLiquidityUnits = this.liquidityUnits.add(
      this.getLiquidityUnits(runeAddAmount, assetAddAmount),
    );

    // get pool units after add
    const newPoolUnits = this.poolUnits.add(estimatedLiquidityUnits);

    return new Percent(estimatedLiquidityUnits.div(newPoolUnits).assetAmount);
  }

  /**
   * get liquidity units after liquidity is added to the pool
   *
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   */
  getLiquidityUnits(runeAddAmount: Amount, assetAddAmount: Amount) {
    // liquidityUnits = P * (r*A + a*R + 2*r*a) / (r*A + a*R + 2*R*A)
    const R = this.pool.runeDepth;
    const A = this.pool.assetDepth;
    const P = this.poolUnits;

    const rA = runeAddAmount.mul(A);
    const aR = assetAddAmount.mul(R);
    const ra = runeAddAmount.mul(assetAddAmount);
    const RA = R.mul(A);

    const numerator = P.mul(rA.add(aR.add(ra.mul(2))));
    const denominator = rA.add(aR.add(RA.mul(2)));

    return numerator.div(denominator);
  }

  /**
   * get slip for add liquidity
   *
   * @param runeAddAmount rune amount to add
   * @param assetAddAmount asset amount to add
   */
  getLiquiditySlip(runeAddAmount: Amount, assetAddAmount: Amount) {
    // formula: (t * R - T * r)/ (T*r + R*T)
    const R = this.pool.runeDepth;
    const T = this.pool.assetDepth;
    const numerator = assetAddAmount.mul(R).sub(T.mul(runeAddAmount));
    const denominator = T.mul(runeAddAmount).add(R.mul(T));

    // set absolute value of percentage, no negative allowed
    return new Percent(numerator.div(denominator).assetAmount.absoluteValue());
  }

  getSymWithdrawAmount(percent: Percent) {
    const runeAmount = this.runeShare.mul(percent as Amount);
    const assetAmount = this.assetShare.mul(percent as Amount);

    return {
      runeAmount,
      assetAmount,
    };
  }

  /**
   *  Ref: https://gitlab.com/thorchain/thornode/-/issues/657
   *  share = (s * A * (2 * T^2 - 2 * T * s + s^2))/T^3
   *  s = stakeUnits for member (after factoring in withdrawBasisPoints)
   *  T = totalPoolUnits for pool
   *  A = assetDepth to be withdrawn
   *
   *  Formula:
   *  share = (s * A * (2 * T^2 - 2 * T * s + s^2))/T^3
   *  (part1 * (part2 - part3 + part4)) / part5
   */
  getAsymRuneShare() {
    const s = this.liquidityUnits;
    const T = this.poolUnits;
    const A = this.pool.runeDepth;

    const part1 = s.mul(A);
    const part2 = T.mul(T).mul(2);
    const part3 = T.mul(s).mul(2);
    const part4 = s.mul(s);
    const numerator = part1.mul(part2.sub(part3).add(part4));
    const part5 = T.mul(T).mul(T);

    const amount = numerator.div(part5);

    return amount;
  }

  getAsymAssetShare() {
    const s = this.liquidityUnits;
    const T = this.poolUnits;
    const A = this.pool.assetDepth;

    const part1 = s.mul(A);
    const part2 = T.mul(T).mul(2);
    const part3 = T.mul(s).mul(2);
    const part4 = s.mul(s);
    const numerator = part1.mul(part2.sub(part3).add(part4));
    const part5 = T.mul(T).mul(T);

    const amount = numerator.div(part5);

    return amount;
  }

  getAsymRuneWithdrawAmount(percent: Percent) {
    return this.getAsymRuneShare().mul(percent as Amount);
  }

  getAsymAssetWithdrawAmount(percent: Percent) {
    return this.getAsymAssetShare().mul(percent as Amount);
  }
}
