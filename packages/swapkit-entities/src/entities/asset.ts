import { AssetSymbol, BaseDecimal, Chain } from '@thorswap-lib/types';

import { getAssetType, getNetworkName } from '../helpers/index.js';

/**
 * L1 asset format:
 * - CHAIN.SYMBOL (Raw string, URL)
 * Synth asset format: CHAIN/SYMBOL
 * - CHAIN/SYMBOL (Raw string)
 * - THOR.CHAIN.SYMBOL (URL)
 */

export class AssetEntity {
  public readonly chain: Chain;
  public readonly symbol: string;
  public readonly ticker: string;
  public readonly type: string;
  public readonly network: string;
  public readonly name: string;
  public decimal: number;
  public isSynth = false;
  public L1Chain: Chain;

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

  constructor(chain: Chain, symbol: string, isSynth = false, ticker?: string) {
    this.chain = chain;
    this.symbol = symbol.toUpperCase();
    this.ticker = ticker || symbol.toUpperCase().split('-')[0];
    this.type = getAssetType(chain, this.ticker, isSynth);
    this.name = isSynth ? `Synth ${this.ticker}` : this.ticker;
    this.network = getNetworkName(chain, this.ticker);
    this.decimal = isSynth ? BaseDecimal.THOR : BaseDecimal[chain];
    this.isSynth = isSynth;
    this.L1Chain = isSynth ? Chain.THORChain : chain;
  }

  public setDecimal = (decimal?: number) => {
    this.decimal = decimal || BaseDecimal[this.chain] || BaseDecimal.THOR;
  };

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

  isRUNE() {
    return this.eq(getSignatureAssetFor(Chain.THORChain));
  }
}

const THOR_MAINNET_SYMBOL = 'THOR-0XA5F2211B9B8170F694421F2046281775E8468044';
const ETH_RUNE_SYMBOL = 'RUNE-0X3155BA85D5F96B2D030A4966AF206230E46849CB';

type Signature = Chain | 'USD' | 'ETH_THOR' | 'ETH_RUNE' | 'BNB_RUNE' | 'THOR';

// @ts-expect-error initialized in getSignatureAssetFor
const cachedSignatureAssets: Record<Signature, AssetEntity> = {};
export const getSignatureAssetFor = (signature: Signature) => {
  if (cachedSignatureAssets[signature]) return cachedSignatureAssets[signature];

  switch (signature) {
    case Chain.Avalanche:
    case Chain.Polygon:
    case Chain.Binance:
    case Chain.BitcoinCash:
    case Chain.Bitcoin:
    case Chain.Doge:
    case Chain.Ethereum:
    case Chain.Litecoin: {
      const asset = new AssetEntity(signature, signature);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.BinanceSmartChain: {
      const bscAsset = new AssetEntity(Chain.BinanceSmartChain, Chain.Binance);
      bscAsset.setDecimal(18);

      cachedSignatureAssets[signature] = bscAsset;
      return bscAsset;
    }

    case Chain.Optimism:
    case Chain.Arbitrum: {
      const aethAsset = new AssetEntity(signature, Chain.Ethereum);
      aethAsset.setDecimal(18);

      cachedSignatureAssets[signature] = aethAsset;
      return aethAsset;
    }

    case Chain.Cosmos: {
      const asset = new AssetEntity(Chain.Cosmos, AssetSymbol.ATOM, false, AssetSymbol.ATOM);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.THORChain: {
      const asset = new AssetEntity(Chain.THORChain, AssetSymbol.RUNE, false, AssetSymbol.RUNE);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case 'USD': {
      const asset = new AssetEntity(Chain.THORChain, 'USD-USD', false, 'USD-USD');

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case 'ETH_THOR': {
      const thorAsset = new AssetEntity(Chain.Ethereum, THOR_MAINNET_SYMBOL);
      thorAsset.setDecimal(18);

      cachedSignatureAssets[signature] = thorAsset;
      return thorAsset;
    }

    /**
     * Remove after KillSwitch
     */
    case 'BNB_RUNE': {
      const asset = new AssetEntity(Chain.Binance, 'RUNE-B1A');

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case 'ETH_RUNE': {
      const ethRune = new AssetEntity(Chain.Ethereum, ETH_RUNE_SYMBOL);
      ethRune.setDecimal(18);

      cachedSignatureAssets[signature] = ethRune;
      return ethRune;
    }

    default: {
      return new AssetEntity(Chain.THORChain, AssetSymbol.RUNE, false, AssetSymbol.RUNE);
    }
  }
};

export const isGasAsset = (asset: AssetEntity) => asset.eq(getSignatureAssetFor(asset.chain));
