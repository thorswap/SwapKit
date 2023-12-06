import type {
  CoinGeckoList,
  MayaList,
  PancakeswapETHList,
  PancakeswapList,
  PangolinList,
  StargateARBList,
  SushiswapList,
  ThorchainList,
  TraderjoeList,
  UniswapList,
  WoofiList,
} from '@swapkit/tokens';
import { BaseDecimal, Chain } from '@swapkit/types';

import type { CommonAssetString } from '../helpers/asset.ts';
import { getAssetType, getCommonAssetInfo, getDecimal, isGasAsset } from '../helpers/asset.ts';
import { validateIdentifier } from '../helpers/validators.ts';

import type { NumberPrimitives } from './bigIntArithmetics.ts';
import { BigIntArithmetics, formatBigIntToSafeValue } from './bigIntArithmetics.ts';
import type { SwapKitValueType } from './swapKitNumber.ts';

type TokenTax = { buy: number; sell: number };

const safeValue = (value: NumberPrimitives, decimal: number) =>
  typeof value === 'bigint'
    ? formatBigIntToSafeValue({ value, bigIntDecimal: decimal, decimal })
    : value;

type AssetValueParams = { decimal: number; value: SwapKitValueType; tax?: TokenTax } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

type TCTokenNames = (typeof ThorchainList)['tokens'][number]['identifier'];

type TokenNames =
  | TCTokenNames
  | (typeof CoinGeckoList)['tokens'][number]['identifier']
  | (typeof MayaList)['tokens'][number]['identifier']
  | (typeof PancakeswapETHList)['tokens'][number]['identifier']
  | (typeof PancakeswapList)['tokens'][number]['identifier']
  | (typeof PangolinList)['tokens'][number]['identifier']
  | (typeof StargateARBList)['tokens'][number]['identifier']
  | (typeof SushiswapList)['tokens'][number]['identifier']
  | (typeof TraderjoeList)['tokens'][number]['identifier']
  | (typeof WoofiList)['tokens'][number]['identifier']
  | (typeof UniswapList)['tokens'][number]['identifier'];

let staticTokensMap:
  | Map<TokenNames, { tax?: TokenTax; decimal: number; identifier: string }>
  | undefined;

const getStaticToken = (identifier: TokenNames) => {
  if (!staticTokensMap) {
    throw new Error('Static assets not loaded, call await AssetValue.loadStaticAssets() first');
  }
  const tokenInfo = staticTokensMap.get(identifier.toUpperCase() as TokenNames);

  return tokenInfo || { decimal: BaseDecimal.THOR, identifier: '' };
};

const createAssetValue = async (assetString: string, value: NumberPrimitives = 0) => {
  validateIdentifier(assetString);

  const decimal = await getDecimal(getAssetInfo(assetString));
  const parsedValue = safeValue(value, decimal);

  return new AssetValue({ decimal, value: parsedValue, identifier: assetString });
};

export class AssetValue extends BigIntArithmetics {
  address?: string;
  chain: Chain;
  isGasAsset = false;
  isSynthetic = false;
  symbol: string;
  tax?: TokenTax;
  ticker: string;
  type: ReturnType<typeof getAssetType>;

  constructor(params: AssetValueParams) {
    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;

    super(
      params.value instanceof BigIntArithmetics
        ? params.value
        : { decimal: params.decimal, value: params.value },
    );

    const assetInfo = getAssetInfo(identifier);

    this.type = getAssetType(assetInfo);
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;

    this.tax = params.tax;
  }

  toString() {
    return this.isSynthetic ? this.symbol : `${this.chain}.${this.symbol}`;
  }

  toUrl() {
    return this.isSynthetic ? `${this.chain}.${this.symbol.replace('/', '.')}` : this.toString();
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }

  // THOR.RUNE
  // THOR.ETH.ETH
  // ETH.THOR-0x1234567890
  static fromUrl(urlAsset: string, value: NumberPrimitives = 0) {
    const [chain, ticker, symbol] = urlAsset.split('.');
    if (!chain || !ticker) throw new Error('Invalid asset url');

    const assetString =
      chain === Chain.THORChain && symbol ? `${chain}.${ticker}/${symbol}` : urlAsset;

    return createAssetValue(assetString, value);
  }

  static fromString(assetString: string, value: NumberPrimitives = 0) {
    return createAssetValue(assetString, value);
  }

  static fromStringSync(assetString: string, value: NumberPrimitives = 0) {
    const { isSynthetic } = getAssetInfo(assetString);
    const {
      tax,
      decimal,
      identifier: tokenIdentifier,
    } = getStaticToken(assetString as unknown as TokenNames);

    const parsedValue = safeValue(value, decimal);

    const asset = tokenIdentifier
      ? new AssetValue({ tax, decimal, identifier: tokenIdentifier, value: parsedValue })
      : isSynthetic
        ? new AssetValue({ tax, decimal: 8, identifier: assetString, value: parsedValue })
        : undefined;

    return asset;
  }

  static fromIdentifier(
    assetString: `${Chain}.${string}` | `${Chain}/${string}` | `${Chain}.${string}-${string}`,
    value: NumberPrimitives = 0,
  ) {
    return createAssetValue(assetString, value);
  }

  static fromIdentifierSync(identifier: TokenNames, value: NumberPrimitives = 0) {
    const { decimal, identifier: tokenIdentifier } = getStaticToken(identifier);
    const parsedValue = safeValue(value, decimal);

    return new AssetValue({ decimal, identifier: tokenIdentifier, value: parsedValue });
  }

  static fromChainOrSignature(assetString: CommonAssetString, value: NumberPrimitives = 0) {
    const { decimal, identifier } = getCommonAssetInfo(assetString);
    const parsedValue = safeValue(value, decimal);

    return new AssetValue({ value: parsedValue, decimal, identifier });
  }

  static loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: any }>(
      async (resolve, reject) => {
        try {
          const tokenPackages = await import('@swapkit/tokens');
          const tokensMap = Object.values(tokenPackages).reduce((acc, { tokens }) => {
            tokens.forEach(({ identifier, chain, ...rest }) => {
              const decimal = 'decimals' in rest ? rest.decimals : BaseDecimal[chain as Chain];

              acc.set(identifier as TokenNames, { identifier, decimal });
            });

            return acc;
          }, new Map<TokenNames, { decimal: number; identifier: string }>());

          staticTokensMap = tokensMap;

          resolve({ ok: true });
        } catch (error) {
          console.error(error);
          reject({
            ok: false,
            error,
            message:
              "Couldn't load static assets. Ensure you have installed @swapkit/tokens package",
          });
        }
      },
    );
  }
}

export const getMinAmountByChain = (chain: Chain) => {
  const asset = AssetValue.fromChainOrSignature(chain);

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.Litecoin:
    case Chain.BitcoinCash:
      return asset.set(0.00010001);

    case Chain.Dogecoin:
      return asset.set(1.00000001);

    case Chain.Avalanche:
    case Chain.Ethereum:
      return asset.set(0.00000001);

    case Chain.THORChain:
    case Chain.Maya:
      return asset.set(0);

    default:
      return asset.set(0.00000001);
  }
};

const getAssetInfo = (identifier: string) => {
  const isSynthetic = identifier.slice(0, 14).includes('/');
  const [synthChain, synthSymbol] = identifier.split('.').pop()!.split('/');
  const adjustedIdentifier =
    identifier.includes('.') && !isSynthetic ? identifier : `${Chain.THORChain}.${synthSymbol}`;

  const [chain, symbol] = adjustedIdentifier.split('.') as [Chain, string];
  const [ticker, address] = (isSynthetic ? synthSymbol : symbol).split('-') as [string, string?];

  return {
    address: address?.toLowerCase(),
    chain,
    isGasAsset: isGasAsset({ chain, symbol }),
    isSynthetic,
    symbol:
      (isSynthetic ? `${synthChain}/` : '') +
      (address ? `${ticker}-${address?.toLowerCase() ?? ''}` : symbol),
    ticker,
  };
};
