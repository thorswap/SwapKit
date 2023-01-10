import { BaseDecimal } from '@thorswap-lib/types';

import { Amount, AmountType } from './amount.js';
import { AssetEntity as Asset } from './asset.js';
import { AssetAmount } from './assetAmount.js';
import { Percent } from './percent.js';
import { Pool } from './pool.js';
import { Price } from './price.js';

export enum SwapType {
  SINGLE_SWAP,
  DOUBLE_SWAP,
}

export enum SynthType {
  MINT,
  REDEEM,
  SWAP,
}

export interface ISynth {
  readonly swapType: SwapType;
  readonly synthType: SynthType;
  readonly inputAsset: Asset;
  readonly outputAsset: Asset;
  readonly price: Price; // input asset price based in output asset

  // swapPools[0]: first swap pool, swapPools[1]: second swap pool(for Double Swap Only)
  readonly swapPools: Pool[];

  readonly inputAmount: AssetAmount;
  readonly outputAmount: AssetAmount;
  readonly outputAmountAfterFee: AssetAmount;
  readonly fee: AssetAmount;
  readonly slip: Percent;

  readonly hasInSufficientFee: boolean;

  minOutputAmount: Amount;
  slipLimitPercent: number;

  setSlipLimitPercent(limit: number): void;
  getSlipLimitPercent(): number;

  getOutputAmount(inputAmount: AssetAmount): AssetAmount;
  getOutputAfterNetworkFee(inputAmount: AssetAmount): AssetAmount;
  getOutputPercent(inputAmount: AssetAmount): Percent;
  getFeePercent(inputAmount: AssetAmount): Percent;
  getInputAmount(outputAmount: AssetAmount): AssetAmount;
  getSlip(inputAmount: AssetAmount): Percent;
  getFee(inputAmount: AssetAmount): AssetAmount;
}

export class Synth implements ISynth {
  private _0_AMOUNT: Amount;
  public readonly estimatedNetworkFee: AssetAmount;
  public readonly fee: AssetAmount;
  public readonly feePercent: Percent;
  public readonly hasInSufficientFee: boolean = false;
  public readonly inputAmount: AssetAmount;
  public readonly inputAsset: Asset;
  public readonly outboundNetworkFee: AssetAmount;
  public readonly outputAmount: AssetAmount;
  public readonly outputAmountAfterFee: AssetAmount;
  public readonly outputAsset: Asset;
  public readonly outputPercent: Percent;
  public readonly price: Price;
  public readonly slip: Percent;
  public readonly swapPools: Pool[] = [];
  public readonly swapType: SwapType;
  public readonly synthType: SynthType;
  public slipLimitPercent: number;

  constructor({
    inputAsset,
    outputAsset,
    pools,
    amount,
    slip = 5,
    fee,
  }: {
    inputAsset: Asset;
    outputAsset: Asset;
    pools: Pool[];
    amount: AssetAmount;
    slip?: number;
    fee?: {
      inboundFee: AssetAmount;
      outboundFee: AssetAmount | null;
    };
  }) {
    if (!amount.gte(0)) throw new Error('Invalid Negative Amount');

    this.inputAsset = inputAsset;
    this.outputAsset = outputAsset;
    this.slipLimitPercent = slip;

    // input asset price based in output asset
    this.price = new Price({
      baseAsset: this.outputAsset,
      quoteAsset: this.inputAsset,
      pools,
    });

    this._0_AMOUNT = Amount.fromAssetAmount(0, inputAsset.decimal);

    // set inbound, outbound fee
    const inboundFee =
      fee?.inboundFee ?? new AssetAmount(inputAsset, Amount.fromAssetAmount(0, inputAsset.decimal));
    this.outboundNetworkFee =
      fee?.outboundFee ??
      new AssetAmount(outputAsset, Amount.fromAssetAmount(0, outputAsset.decimal));

    // synth swap Asset <> Asset
    if (!this.inputAsset.isRUNE() && !this.outputAsset.isRUNE()) {
      this.synthType = SynthType.SWAP;
      this.swapType = SwapType.DOUBLE_SWAP;

      const firstSwapPool = Pool.byAsset(this.inputAsset, pools);
      const secondSwapPool = Pool.byAsset(this.outputAsset, pools);

      if (!(firstSwapPool && secondSwapPool)) throw new Error('Invalid Pool');
      if (firstSwapPool && secondSwapPool) {
        this.swapPools = [firstSwapPool, secondSwapPool];
      }
    } else {
      // synth swap RUNE <> Asset or Asset <> RUNE
      this.swapType = SwapType.SINGLE_SWAP;

      // swap Asset <> RUNE
      if (this.outputAsset.isRUNE()) {
        this.synthType = SynthType.REDEEM;

        const firstSwapPool = Pool.byAsset(this.inputAsset, pools);
        if (!firstSwapPool) throw new Error('Invalid Pool');

        if (firstSwapPool) {
          this.swapPools = [firstSwapPool];
        }
      } else {
        // swap RUNE <> Asset
        this.synthType = SynthType.MINT;

        const firstSwapPool = Pool.byAsset(this.outputAsset, pools);
        if (!firstSwapPool) throw new Error('Invalid Pool');

        if (firstSwapPool) {
          this.swapPools = [firstSwapPool];
        }
      }
    }

    // get estimated network fee
    const lastPool = this.swapType === SwapType.SINGLE_SWAP ? this.swapPools[0] : this.swapPools[1];

    this.estimatedNetworkFee = this.getNetworkFee(lastPool, this.outputAsset.isRUNE());

    // set input, output, slip, fee, percent
    if (amount.asset === this.inputAsset) {
      this.inputAmount = amount;

      // // subtract inboundFee from input amount
      // const inputAfterFee = this.inputAmount.sub(inboundFee)

      this.outputAmount = this.getOutputAmount(this.inputAmount);
      this.outputAmountAfterFee = this.getOutputAfterNetworkFee(this.inputAmount);
      // this.outputAmountAfterFee = outputAmountAfterSlipFee.sub(outboundFee)

      // validate
      if (this.outputAmountAfterFee.lt(0)) {
        this.hasInSufficientFee = true;
        this.outputAmountAfterFee = new AssetAmount(
          this.outputAsset,
          Amount.fromAssetAmount(0, this.outputAsset.decimal),
        );
      }
    } else {
      this.outputAmountAfterFee = amount;

      // add outbound fee to exact output amount
      this.outputAmount = amount.add(this.outboundNetworkFee);
      // add inbound fee to input amount
      this.inputAmount = this.getInputAmount(amount).add(inboundFee);

      // validate
      if (this.inputAmount.lt(this._0_AMOUNT)) {
        this.hasInSufficientFee = true;
        this.inputAmount = new AssetAmount(this.inputAsset, this._0_AMOUNT);
      }
    }

    this.fee = this.getFee(this.inputAmount);
    this.outputPercent = this.getOutputPercent(this.inputAmount);
    this.feePercent = this.getFeePercent(this.inputAmount);

    // // subtract inboundFee from input amount
    // const inputAfterFee = this.inputAmount.sub(inboundFee)
    this.slip = this.getSlip(this.inputAmount);
  }

  setSlipLimitPercent(limit: number) {
    this.slipLimitPercent = limit;
  }

  getSlipLimitPercent() {
    return this.slipLimitPercent;
  }

  public get minOutputAmount() {
    return this.outputAmountAfterFee.mul(100 - this.slipLimitPercent).div(100).amount;
  }

  isSlipValid() {
    if (this.slip.gt(new Percent(this.slipLimitPercent / 100))) {
      return false;
    }

    return true;
  }

  isValid() {
    // check fee
    if (this.hasInSufficientFee) return { valid: false, msg: 'Insufficient Fee' };

    // check input amount
    if (this.inputAmount.lte(Amount.fromAssetAmount(0, this.inputAmount.decimal))) {
      return { valid: false, msg: 'invalid input amount' };
    }

    // check slip amount
    if (!this.isSlipValid()) {
      return {
        valid: false,
        msg: `Slip is higher than ${this.slipLimitPercent.toFixed()}%`,
      };
    }

    return { valid: true };
  }

  public static getSingleSwapOutput(inputAmount: AssetAmount, pool: Pool) {
    // formula: (x * X * Y) / (x + X) ^ 2
    const toRUNE = !inputAmount.asset.isRUNE();
    const outputAsset = toRUNE ? Asset.RUNE() : pool.asset;

    const x = inputAmount.amount;
    const X = toRUNE ? pool.assetDepth : pool.runeDepth;
    const Y = toRUNE ? pool.runeDepth : pool.assetDepth;
    const numerator = x.mul(X).mul(Y);
    const denominator = new Amount(
      x.add(X).assetAmount.pow(2),
      AmountType.ASSET_AMOUNT,
      BaseDecimal.THOR,
    );

    return new AssetAmount(outputAsset, numerator.div(denominator));
  }

  getOutputAmount(inputAmount: AssetAmount) {
    if (inputAmount.asset !== this.inputAsset) throw new Error('Invalid Asset');

    if (this.swapType === SwapType.SINGLE_SWAP) {
      return Synth.getSingleSwapOutput(inputAmount, this.swapPools[0]);
    }

    if (inputAmount.asset.isRUNE()) throw new Error('Invalid Asset');

    // double swap formula: getSwapOutput(getSwapOutput(x, X), Y)
    const firstSwapOutput = Synth.getSingleSwapOutput(inputAmount, this.swapPools[0]);

    return Synth.getSingleSwapOutput(firstSwapOutput, this.swapPools[1]);
  }

  private getSingleSwapOutputAfterNetworkFee(inputAmount: AssetAmount, pool: Pool) {
    // formula: getSwapOutput() - network fee (0.02 RUNE)
    const toRUNE = !inputAmount.asset.isRUNE();
    const swapOutputAmount = Synth.getSingleSwapOutput(inputAmount, pool);
    const runeDepthAfterSwap = toRUNE
      ? pool.runeDepth.sub(swapOutputAmount)
      : pool.runeDepth.add(inputAmount);
    const assetDepthAfterSwap = toRUNE
      ? pool.assetDepth.add(inputAmount)
      : pool.assetDepth.sub(swapOutputAmount);
    const poolAfterSwap = new Pool(
      pool.asset,
      runeDepthAfterSwap,
      assetDepthAfterSwap,
      pool.detail,
    );

    const networkFee = this.getNetworkFee(poolAfterSwap, toRUNE);
    const outputAsset = toRUNE ? Asset.RUNE() : pool.asset;

    return new AssetAmount(
      this.outputAsset,
      swapOutputAmount.sub(new AssetAmount(outputAsset, networkFee)),
    );
  }

  private getNetworkFee(pool: Pool, toRUNE: boolean) {
    // network fee is 0.02 RUNE
    const networkFeeInRune = Amount.fromAssetAmount(0.02, BaseDecimal.THOR);

    const feeAmount: Amount = toRUNE
      ? networkFeeInRune
      : networkFeeInRune.mul(pool.priceOf(Asset.RUNE()));

    return new AssetAmount(this.outputAsset, feeAmount);
  }

  getOutputAfterNetworkFee(inputAmount: AssetAmount) {
    if (inputAmount.asset !== this.inputAsset) throw new Error('Invalid Asset');

    if (this.swapType === SwapType.SINGLE_SWAP) {
      return this.getSingleSwapOutputAfterNetworkFee(inputAmount, this.swapPools[0]);
    }

    if (inputAmount.asset.isRUNE()) throw new Error('Invalid Asset');

    // double swap formula: getDoubleSwapOutput - 1 RUNE
    const toRUNE = !inputAmount.asset.isRUNE();
    const doubleSwapOutput = this.getOutputAmount(inputAmount);
    const pool = this.swapPools[1];

    const runeDepthAfterSwap = toRUNE
      ? pool.runeDepth.sub(doubleSwapOutput)
      : pool.runeDepth.add(inputAmount);
    const assetDepthAfterSwap = toRUNE
      ? pool.assetDepth.add(inputAmount)
      : pool.assetDepth.sub(doubleSwapOutput);
    const poolAfterSwap = new Pool(
      pool.asset,
      runeDepthAfterSwap,
      assetDepthAfterSwap,
      pool.detail,
    );

    const networkFee = this.getNetworkFee(poolAfterSwap, this.outputAsset.isRUNE());

    return new AssetAmount(
      this.outputAsset,
      doubleSwapOutput.sub(new AssetAmount(this.outputAsset, networkFee)),
    );
  }

  // output / input
  getOutputPercent(inputAmount: AssetAmount) {
    const outputAmount = this.getOutputAfterNetworkFee(inputAmount);
    const inputAmountInOutputAsset = inputAmount.totalPriceIn(
      this.outputAsset,
      this.swapPools,
    ).amount;

    return new Percent(outputAmount.div(inputAmountInOutputAsset).assetAmount);
  }

  // 1 - output / input
  getFeePercent(inputAmount: AssetAmount) {
    const outputPercent = this.getOutputPercent(inputAmount);
    return new Percent(
      Amount.fromAssetAmount(1, outputPercent.decimal).sub(outputPercent).assetAmount,
    );
  }

  public static getSingleSwapInput(outputAmount: AssetAmount, pool: Pool) {
    // formula: (((X*Y)/y - 2*X) - sqrt(((X*Y)/y - 2*X)^2 - 4*X^2))/2
    // (part1 - sqrt(part1 - part2))/2
    const toRUNE = outputAmount.asset.isRUNE();
    const y = outputAmount.amount;
    const X = toRUNE ? pool.assetDepth : pool.runeDepth;
    const Y = toRUNE ? pool.runeDepth : pool.assetDepth;
    const part1: Amount = X.mul(Y).div(y).sub(X.mul(2));
    const part2: Amount = new Amount(
      X.assetAmount.pow(2).multipliedBy(4),
      AmountType.ASSET_AMOUNT,
      BaseDecimal.THOR,
    );

    const inputAmount = new Amount(
      part1.assetAmount.minus(part1.assetAmount.pow(2).minus(part2.assetAmount).sqrt()).div(2),
      AmountType.ASSET_AMOUNT,
      BaseDecimal.THOR,
    );
    const inputAsset = !toRUNE ? Asset.RUNE() : pool.asset;

    return new AssetAmount(inputAsset, inputAmount);
  }

  getInputAmount(outputAmount: AssetAmount) {
    if (outputAmount.asset === this.outputAsset) throw new Error('Invalid Asset');

    if (this.swapType === SwapType.SINGLE_SWAP) {
      return Synth.getSingleSwapInput(outputAmount, this.swapPools[0]);
    }

    if (outputAmount.asset.isRUNE()) throw new Error('Invalid Asset');

    // double swap formula: getSwapInput(getSwapInput(y, Y), X)
    const secondSwapInput = Synth.getSingleSwapInput(outputAmount, this.swapPools[1]);

    return Synth.getSingleSwapInput(secondSwapInput, this.swapPools[0]);
  }

  public static getSingleSwapSlip(inputAmount: AssetAmount, pool: Pool) {
    // formula: (x) / (x + X)
    const x = inputAmount.amount;
    const X = pool.depthOf(inputAmount.asset);

    return new Percent(x.div(x.add(X)).assetAmount);
  }

  getSlip = (inputAmount: AssetAmount) => {
    if (inputAmount.asset !== this.inputAsset) throw new Error('Invalid Asset');

    if (this.swapType === SwapType.SINGLE_SWAP) {
      return Synth.getSingleSwapSlip(inputAmount, this.swapPools[0]);
    }

    if (inputAmount.asset.isRUNE()) throw new Error('Invalid Asset');

    // double swap slip formula: getSingleSwapSlip(input1) + getSingleSwapSlip(getSwapOutput1 => input2)
    const firstSlip = Synth.getSingleSwapSlip(inputAmount, this.swapPools[0]);
    const firstSwapOutput = Synth.getSingleSwapOutput(inputAmount, this.swapPools[0]);
    const secondSlip = Synth.getSingleSwapSlip(firstSwapOutput, this.swapPools[1]);

    return new Percent(firstSlip.add(secondSlip).assetAmount);
  };

  // fee amount is based in output asset
  public static getSingleSwapFee(inputAmount: AssetAmount, pool: Pool) {
    // formula: (x * x * Y) / (x + X) ^ 2
    const toRUNE = !inputAmount.asset.isRUNE();
    const outputAsset = toRUNE ? Asset.RUNE() : pool.asset;

    const x = inputAmount.amount;
    const X = toRUNE ? pool.assetDepth : pool.runeDepth;
    const Y = toRUNE ? pool.runeDepth : pool.assetDepth;
    const numerator = x.mul(X).mul(Y);
    const denominator = new Amount(
      x.add(X).assetAmount.pow(2),
      AmountType.ASSET_AMOUNT,
      BaseDecimal.THOR,
    );

    return new AssetAmount(outputAsset, numerator.div(denominator));
  }

  // fee amount is based in output asset
  getFee(inputAmount: AssetAmount) {
    if (inputAmount.asset !== this.inputAsset) throw new Error('Invalid Asset');

    if (this.swapType === SwapType.SINGLE_SWAP) {
      return Synth.getSingleSwapFee(inputAmount, this.swapPools[0]);
    }

    if (inputAmount.asset.isRUNE()) throw new Error('Invalid Asset');

    // double swap fee: getSwapFee1 + getSwapFee2
    const firstSwapOutput = Synth.getSingleSwapOutput(inputAmount, this.swapPools[0]);
    // first swap fee is always based in rune
    const firstSwapFeeInRune = Synth.getSingleSwapFee(inputAmount, this.swapPools[0]);

    // second swap fee based in output asset
    const secondSwapFeeInAsset = Synth.getSingleSwapFee(firstSwapOutput, this.swapPools[1]);

    // first swap fee based in output asset
    const firstSwapFeeInAsset = new AssetAmount(Asset.RUNE(), firstSwapFeeInRune).totalPriceIn(
      this.outputAsset,
      this.swapPools,
    );

    return new AssetAmount(this.outputAsset, firstSwapFeeInAsset.add(secondSwapFeeInAsset));
  }
}
