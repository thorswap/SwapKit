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

  identifier() {
    return `${this.chain}.${this.symbol}`;
  }

  toSynth() {
    if (this.isSynth) return this;
    return new AssetEntity(Chain.THORChain, `${this.chain}/${this.symbol}`, true);
  }
}

const THOR_MAINNET_SYMBOL = 'THOR-0xa5f2211B9b8170F694421f2046281775E8468044';
const VTHOR_MAINNET_SYMBOL = 'VTHOR-0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D';

type Signature = Chain | 'USD' | 'ETH_THOR' | 'ETH_VTHOR';

// @ts-expect-error initialized in getSignatureAssetFor
const cachedSignatureAssets: Record<Signature, AssetEntity> = {};
export const getSignatureAssetFor = (signature: Signature, synth: boolean = false) => {
  if (cachedSignatureAssets[signature]) return cachedSignatureAssets[signature];

  switch (signature) {
    case Chain.Avalanche:
    case Chain.Binance:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Ethereum:
    case Chain.Litecoin: {
      const asset = new AssetEntity(signature, signature, synth);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.Optimism:
    case Chain.Arbitrum: {
      const asset = new AssetEntity(signature, Chain.Ethereum, synth);
      asset.setDecimal(18);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.BinanceSmartChain: {
      const bscAsset = new AssetEntity(signature, Chain.Binance, synth);
      bscAsset.setDecimal(18);

      cachedSignatureAssets[signature] = bscAsset;
      return bscAsset;
    }

    case Chain.Polygon: {
      const asset = new AssetEntity(signature, signature, synth);
      asset.setDecimal(18);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.Cosmos: {
      const asset = new AssetEntity(signature, AssetSymbol.ATOM, synth, AssetSymbol.ATOM);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case Chain.THORChain: {
      const asset = new AssetEntity(Chain.THORChain, AssetSymbol.RUNE, synth, AssetSymbol.RUNE);

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case 'USD': {
      const asset = new AssetEntity(Chain.THORChain, 'USD-USD', synth, 'USD-USD');

      cachedSignatureAssets[signature] = asset;
      return asset;
    }

    case 'ETH_THOR': {
      const thorAsset = new AssetEntity(Chain.Ethereum, THOR_MAINNET_SYMBOL, synth);
      thorAsset.setDecimal(18);

      cachedSignatureAssets[signature] = thorAsset;
      return thorAsset;
    }

    case 'ETH_VTHOR': {
      const vthorAsset = new AssetEntity(Chain.Ethereum, VTHOR_MAINNET_SYMBOL, synth);
      vthorAsset.setDecimal(18);

      cachedSignatureAssets[signature] = vthorAsset;
      return vthorAsset;
    }

    default: {
      return new AssetEntity(Chain.THORChain, AssetSymbol.RUNE, synth, AssetSymbol.RUNE);
    }
  }
};

export const isGasAsset = (asset: AssetEntity) => asset.eq(getSignatureAssetFor(asset.chain));
