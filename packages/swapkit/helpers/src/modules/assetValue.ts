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

const safeValue = (value: NumberPrimitives, decimal: number) =>
  typeof value === 'bigint'
    ? formatBigIntToSafeValue({ value, bigIntDecimal: decimal, decimal })
    : value;

type AssetValueParams = { decimal: number; value: SwapKitValueType } & (
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

let staticTokensMap: Map<TokenNames, { decimal: number; identifier: string }> | undefined;

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
  isSynthetic = false;
  isGasAsset = false;
  symbol: string;
  ticker: string;
  type: ReturnType<typeof getAssetType>;

  constructor(params: AssetValueParams) {
    super(
      params.value instanceof BigIntArithmetics
        ? params.value
        : { decimal: params.decimal, value: params.value },
    );

    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;
    const assetInfo = getAssetInfo(identifier);

    this.type = getAssetType(assetInfo);
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;
  }

  get assetValue() {
    return `${this.getValue('string')} ${this.ticker}`;
  }

  toString(short = false) {
    // THOR.RUNE | ETH/ETH
    const shortFormat = this.isSynthetic
      ? this.symbol.split('-')[0]
      : `${this.chain}.${this.ticker}`;

    return short
      ? shortFormat
      : // THOR.ETH/ETH | ETH.USDT-0x1234567890
        `${this.chain}.${this.symbol}`;
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }

  static async fromString(assetString: string, value: NumberPrimitives = 0) {
    return createAssetValue(assetString, value);
  }

  static fromStringSync(assetString: string, value: NumberPrimitives = 0) {
    const { isSynthetic } = getAssetInfo(assetString);
    const { decimal, identifier: tokenIdentifier } = getStaticToken(
      assetString as unknown as TokenNames,
    );

    const parsedValue = safeValue(value, decimal);

    return tokenIdentifier
      ? new AssetValue({ decimal, identifier: tokenIdentifier, value: parsedValue })
      : isSynthetic
      ? new AssetValue({ decimal: 8, identifier: assetString, value: parsedValue })
      : undefined;
  }

  static async fromIdentifier(
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

  static async loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: any }>(
      async (resolve, reject) => {
        try {
          const {
            // Omit ThorchainList from import to avoid decimals conflict (TC uses 8 for all)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ThorchainList: _ThorchainList,
            NativeList,
            ...tokensPackage
          } = await import('@swapkit/tokens');
          const tokensMap = [NativeList, ...Object.values(tokensPackage)].reduce(
            (acc, { tokens }) => {
              tokens.forEach(({ identifier, chain, ...rest }) => {
                const decimal = 'decimals' in rest ? rest.decimals : BaseDecimal[chain as Chain];

                acc.set(identifier as TokenNames, { identifier, decimal });
              });

              return acc;
            },
            new Map<TokenNames, { decimal: number; identifier: string }>(),
          );

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
      return asset.add(10001);

    case Chain.Dogecoin:
      return asset.add(100000001);

    case Chain.Avalanche:
    case Chain.Ethereum:
      return asset.add(10 * 10 ** 9);

    case Chain.THORChain:
    case Chain.Maya:
      return asset.add(0);

    default:
      return asset.add(1);
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
    ticker: ticker,
  };
};
