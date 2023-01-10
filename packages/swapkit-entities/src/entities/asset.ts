import { Asset as AssetObj, AssetSymbol, BaseDecimal, Chain } from '@thorswap-lib/types';

import { getAssetType, getNetworkName } from '../helpers/index.js';

export type AssetNetwork = 'mainnet' | 'testnet';

const THOR_MAINNET_SYMBOL = 'THOR-0XA5F2211B9B8170F694421F2046281775E8468044';
const ETH_RUNE_SYMBOL = 'RUNE-0X3155BA85D5F96B2D030A4966AF206230E46849CB';

export interface IAsset {
  readonly chain: Chain;
  readonly symbol: string;
  readonly ticker: string;
  readonly type: string;
  readonly name: string;
  readonly network: string;

  decimal: number;

  isSynth: boolean;

  getAssetObj(): AssetObj;
  toString(): string;
  currencySymbol(): string;
  eq(asset: AssetEntity): boolean;
  isRUNE(): boolean;
  isBNB(): boolean;
}

/**
 * L1 asset format:
 * - CHAIN.SYMBOL (Raw string, URL)
 * Synth asset format: CHAIN/SYMBOL
 * - CHAIN/SYMBOL (Raw string)
 * - THOR.CHAIN.SYMBOL (URL)
 */

export class AssetEntity implements IAsset {
  public readonly chain: Chain;
  public readonly symbol: string;
  public readonly ticker: string;
  public readonly type: string;
  public readonly network: string;
  public readonly name: string;
  public decimal: number;
  public isSynth = false;

  // created for USD pricing
  public static USD() {
    return new AssetEntity(Chain.THORChain, 'USD-USD');
  }

  public static BNB() {
    return new AssetEntity(Chain.Binance, AssetSymbol.BNB);
  }

  public static BSC() {
    const bscAsset = new AssetEntity(Chain.BinanceSmartChain, AssetSymbol.BNB);
    bscAsset.setDecimal(18);
    return bscAsset;
  }

  public static RUNE() {
    return new AssetEntity(Chain.THORChain, AssetSymbol.RUNE);
  }

  public static THOR() {
    const thorAsset = new AssetEntity(Chain.Ethereum, THOR_MAINNET_SYMBOL);
    thorAsset.setDecimal(18);

    return thorAsset;
  }

  public static BNB_RUNE() {
    return new AssetEntity(Chain.Binance, 'RUNE-B1A');
  }

  public static ETH_RUNE() {
    const ethRune = new AssetEntity(Chain.Ethereum, ETH_RUNE_SYMBOL);
    ethRune.setDecimal(18);
    return ethRune;
  }

  public static BTC() {
    return new AssetEntity(Chain.Bitcoin, AssetSymbol.BTC);
  }

  public static ETH() {
    return new AssetEntity(Chain.Ethereum, AssetSymbol.ETH);
  }

  public static AVAX() {
    return new AssetEntity(Chain.Avalanche, AssetSymbol.AVAX);
  }

  public static LTC() {
    return new AssetEntity(Chain.Litecoin, AssetSymbol.LTC);
  }

  public static DOGE() {
    return new AssetEntity(Chain.Doge, AssetSymbol.DOGE);
  }

  public static BCH() {
    return new AssetEntity(Chain.BitcoinCash, AssetSymbol.BCH);
  }

  public static ATOM() {
    return new AssetEntity(Chain.Cosmos, AssetSymbol.ATOM, false, AssetSymbol.ATOM);
  }

  public static fromAssetString(asset?: string) {
    if (!asset) return null;

    const isSynth = asset.includes('/');
    const [chain, ...symbolArray] = asset.split(isSynth ? '/' : '.');
    const symbol = symbolArray.join('.');
    const ticker = symbol?.split('-')?.[0];
    const canCreateAsset = chain && symbol && ticker;

    return canCreateAsset ? new AssetEntity(chain as Chain, symbol, isSynth) : null;
  }

  /**
   *
   * @param urlEncodedAsset asset string from url
   * @returns btc.btc -> btc.btc, thor.btc.btc -> btc/btc
   */
  public static decodeFromURL = (urlEncodedAsset: string) => {
    let assetString = urlEncodedAsset.toUpperCase();

    if (assetString.startsWith('THOR.') && assetString.split('THOR.')?.[1] !== 'RUNE') {
      // synth asset
      assetString = assetString.split('THOR.')?.[1]?.replace('.', '/');
    }

    return AssetEntity.fromAssetString(assetString);
  };

  public static getDecimalByChainAndSymbol(chain: Chain) {
    return BaseDecimal[chain] || BaseDecimal.THOR;
  }

  constructor(chain: Chain, symbol: string, isSynth = false, ticker?: string) {
    this.chain = chain;
    this.symbol = symbol.toUpperCase();
    this.ticker = ticker || AssetEntity.getTicker(symbol.toUpperCase());
    this.type = getAssetType(chain, this.ticker, isSynth);
    this.name = isSynth ? `Synth ${this.ticker}` : this.ticker;
    this.network = getNetworkName(chain, this.ticker);
    this.decimal = isSynth ? BaseDecimal.THOR : AssetEntity.getDecimalByChainAndSymbol(chain);
    this.isSynth = isSynth;
  }

  get L1Chain() {
    if (this.isSynth) return Chain.THORChain;

    return this.chain;
  }

  public setDecimal = (decimal?: number) => {
    this.decimal = decimal || BaseDecimal[this.L1Chain] || BaseDecimal.THOR;
  };

  public static getTicker(symbol: string) {
    return symbol.split('-')[0];
  }

  public getAssetObj() {
    // synth format: THOR.btc/btc (NOTE: lowercase notation)
    if (this.isSynth) {
      const synthSymbol = `${this.chain.toLowerCase()}/${this.symbol.toLowerCase()}`;

      return {
        chain: Chain.THORChain,
        symbol: synthSymbol,
        ticker: synthSymbol,
      };
    }

    // L1 format: BTC.BTC
    return { chain: this.chain, symbol: this.symbol, ticker: this.ticker };
  }

  /**
   * convert asset entity to string
   * @returns L1 asset -> btc.btc, Synth asset -> btc/btc
   */
  toString() {
    return `${this.chain}${this.isSynth ? '/' : '.'}${this.symbol}`;
  }

  toURLEncoded() {
    return `${this.isSynth ? 'THOR.' : ''}${this.chain}.${this.symbol}`;
  }

  currencySymbol() {
    return this.ticker;
  }

  // full compare chain, symbol, synth
  eq(asset: AssetEntity) {
    return (
      this.chain === asset.chain &&
      this.symbol.toUpperCase() === asset.symbol.toUpperCase() &&
      this.ticker.toUpperCase() === asset.ticker.toUpperCase() &&
      this.isSynth === asset.isSynth
      // this.decimal === asset.decimal
    );
  }

  // compare chain, symbol but not synth
  shallowEq(asset: AssetEntity) {
    return (
      this.chain === asset.chain &&
      this.symbol.toUpperCase() === asset.symbol.toUpperCase() &&
      this.ticker.toUpperCase() === asset.ticker.toUpperCase()
    );
  }

  isGasAsset = () => {
    return (
      this.eq(AssetEntity.RUNE()) ||
      this.eq(AssetEntity.AVAX()) ||
      this.eq(AssetEntity.ETH()) ||
      this.eq(AssetEntity.BTC()) ||
      this.eq(AssetEntity.BNB()) ||
      this.eq(AssetEntity.BCH()) ||
      this.eq(AssetEntity.DOGE()) ||
      this.eq(AssetEntity.LTC())
    );
  };

  isRUNE() {
    return this.eq(AssetEntity.RUNE());
  }

  isBTC() {
    return this.eq(AssetEntity.BTC());
  }

  isDOGE() {
    return this.eq(AssetEntity.DOGE());
  }

  isBNB() {
    return this.eq(AssetEntity.BNB());
  }

  isBSC() {
    return this.eq(AssetEntity.BSC());
  }

  isETH() {
    return this.eq(AssetEntity.ETH());
  }

  isAVAX() {
    return this.eq(AssetEntity.AVAX());
  }
}
