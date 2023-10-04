import type {
  CoinGeckoList,
  PancakeswapETHList,
  PancakeswapList,
  PangolinList,
  StargateARBList,
  SushiswapList,
  ThorchainList,
  TraderjoeList,
  UniswapList,
  WoofiList,
} from '@thorswap-lib/tokens';
import { BaseDecimal, Chain } from '@thorswap-lib/types';

import { getAssetType, getCommonAssetInfo, getDecimal, isGasAsset } from '../helpers/asset.ts';
import { validateIdentifier } from '../helpers/validators.ts';

import { BigIntArithmetics } from './bigIntArithmetics.ts';
import type { SwapKitValueType } from './swapKitNumber.ts';

type AssetValueParams = { decimal: number; value: SwapKitValueType } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

type TCTokenNames = (typeof ThorchainList)['tokens'][number]['identifier'];

type TokenNames =
  | TCTokenNames
  | (typeof CoinGeckoList)['tokens'][number]['identifier']
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
  const tokenInfo = staticTokensMap.get(identifier);

  return tokenInfo || { decimal: BaseDecimal.THOR, identifier: '' };
};

const createAssetValue = async (assetString: string, value: number | string = 0) => {
  validateIdentifier(assetString);

  const decimal = await getDecimal(getAssetInfo(assetString));
  return new AssetValue({ decimal, value, identifier: assetString });
};

export class AssetValue extends BigIntArithmetics {
  static async fromString(assetString: string, value: number | string = 0) {
    return createAssetValue(assetString, value);
  }

  static fromStringSync(assetString: string, value: number | string = 0) {
    const { decimal, identifier: tokenIdentifier } = getStaticToken(
      assetString as unknown as TokenNames,
    );

    return tokenIdentifier
      ? new AssetValue({ decimal, identifier: tokenIdentifier, value })
      : undefined;
  }

  static async fromIdentifier(
    assetString: `${Chain}.${string}` | `${Chain}/${string}` | `${Chain}.${string}-${string}`,
    value: number | string = 0,
  ) {
    return createAssetValue(assetString, value);
  }

  static fromIdentifierSync(identifier: TokenNames, value: number | string = 0) {
    const { decimal, identifier: tokenIdentifier } = getStaticToken(identifier);

    return new AssetValue({ decimal, identifier: tokenIdentifier, value });
  }

  static fromChainOrSignature(
    assetString: 'ETH.THOR' | 'ETH.vTHOR' | Chain,
    value: number | string = 0,
  ) {
    const { decimal, identifier } = getCommonAssetInfo(assetString);

    return new AssetValue({ value, decimal, identifier });
  }

  static async fromTCQuote(identifier: TCTokenNames, value: number | string = 0) {
    const decimal = await getDecimal(getAssetInfo(identifier));
    const shiftedValue = this.shiftDecimals({ value, from: BaseDecimal.THOR, to: decimal });

    return new AssetValue({ value: shiftedValue, identifier, decimal });
  }

  static fromTCQuoteStatic(identifier: TCTokenNames, value: number | string = 0) {
    const tokenInfo = getStaticToken(identifier);
    const shiftedValue = this.shiftDecimals({
      value,
      from: BaseDecimal.THOR,
      to: tokenInfo.decimal,
    });

    return new AssetValue({ ...tokenInfo, value: shiftedValue });
  }

  static async loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: any }>(
      async (resolve, reject) => {
        try {
          const tokensPackage = await import('@thorswap-lib/tokens');
          const tokensMap = Object.values(tokensPackage).reduce((acc, { tokens }) => {
            tokens.forEach(({ identifier, chain, ...rest }) => {
              const decimal = 'decimals' in rest ? rest.decimals : BaseDecimal[chain];

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
              "Couldn't load static assets. Ensure you have installed @thorswap-lib/tokens package",
          });
        }
      },
    );
  }

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
    return `${this.value} ${this.ticker}`;
  }

  toString() {
    return `${this.chain}.${this.symbol}`;
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }
}

export const getMinAmountByChain = (chain: Chain) => {
  const asset = AssetValue.fromChainOrSignature(chain);
  const minAmount = [Chain.Bitcoin, Chain.Litecoin, Chain.BitcoinCash].includes(chain)
    ? // 10001 satoshi
      10001
    : [Chain.Dogecoin].includes(chain)
    ? // 1 DOGE
      100000001
    : [Chain.Avalanche, Chain.Ethereum].includes(chain)
    ? //  10 gwei
      10 * 10 ** 9
    : chain === Chain.THORChain
    ? // 0 RUNE
      0
    : 1;

  return asset.add(minAmount);
};

const getAssetInfo = (identifier: string) => {
  const isSynthetic = identifier.slice(0, 14).includes('/');
  const adjustedIdentifier = identifier.includes('.')
    ? identifier
    : `${Chain.THORChain}.${identifier}`;

  const [chain, symbol] = adjustedIdentifier.split('.') as [Chain, string];
  const [ticker, address] = symbol.split('-') as [string, string?];

  return {
    address,
    chain,
    isGasAsset: isGasAsset({ chain, symbol }),
    isSynthetic,
    symbol,
    ticker: isSynthetic ? symbol : ticker,
  };
};
