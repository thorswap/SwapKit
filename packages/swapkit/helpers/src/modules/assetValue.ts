import {
  type CommonAssetString,
  CommonAssetStrings,
  getAssetType,
  getCommonAssetInfo,
  getDecimal,
  isGasAsset,
} from "../helpers/asset.ts";
import { validateIdentifier } from "../helpers/validators.ts";
import { BaseDecimal, Chain, type ChainId, ChainToChainId } from "../types/chains.ts";
import type { TokenNames, TokenTax } from "../types/tokens.ts";

import type { NumberPrimitives } from "./bigIntArithmetics.ts";
import { BigIntArithmetics, formatBigIntToSafeValue } from "./bigIntArithmetics.ts";
import { SwapKitError } from "./swapKitError.ts";
import type { SwapKitValueType } from "./swapKitNumber.ts";

const staticTokensMap = new Map<
  TokenNames,
  { tax?: TokenTax; decimal: number; identifier: string }
>();

type ConditionalAssetValueReturn<T extends { asyncTokenLookup?: boolean }> =
  T["asyncTokenLookup"] extends true ? Promise<AssetValue> : AssetValue;

type AssetIdentifier =
  | { asset: CommonAssetString }
  | { asset: TokenNames }
  | { asset: string }
  | { chain: Chain };

type AssetValueFromParams = AssetIdentifier & {
  value?: NumberPrimitives | SwapKitValueType;
  fromBaseDecimal?: number;
  asyncTokenLookup?: boolean;
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
  chainId: ChainId;

  constructor({
    value,
    decimal,
    tax,
    chain,
    symbol,
    identifier,
  }: { decimal: number; value: SwapKitValueType; tax?: TokenTax } & (
    | { chain: Chain; symbol: string; identifier?: never }
    | { identifier: string; chain?: never; symbol?: never }
  )) {
    super(typeof value === "object" ? value : { decimal, value });

    const assetInfo = getAssetInfo(identifier || `${chain}.${symbol}`);

    this.type = getAssetType(assetInfo);
    this.tax = tax;
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;
    this.chainId = ChainToChainId[assetInfo.chain];
  }

  toString() {
    return this.isSynthetic ? this.symbol : `${this.chain}.${this.symbol}`;
  }

  toUrl() {
    return this.isSynthetic ? `${this.chain}.${this.symbol.replace("/", ".")}` : this.toString();
  }

  eqAsset({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }

  eq(assetValue: AssetValue) {
    return this.eqAsset(assetValue) && this.eqValue(assetValue);
  }

  // THOR.RUNE
  // THOR.ETH.ETH
  // ETH.THOR-0x1234567890
  static fromUrl(urlAsset: string, value: NumberPrimitives = 0) {
    const [chain, ticker, symbol] = urlAsset.split(".");
    if (!(chain && ticker)) {
      throw new SwapKitError({
        errorKey: "helpers_invalid_asset_url",
        info: { urlAsset },
      });
    }

    const asset = chain === Chain.THORChain && symbol ? `${chain}.${ticker}/${symbol}` : urlAsset;

    return AssetValue.from({ asset, value });
  }

  static from<T extends {}>({
    value = 0,
    fromBaseDecimal,
    asyncTokenLookup,
    ...fromAssetOrChain
  }: T & AssetValueFromParams): ConditionalAssetValueReturn<T> {
    const parsedValue = value instanceof BigIntArithmetics ? value.getValue("string") : value;

    const isFromChain = "chain" in fromAssetOrChain;

    const assetOrChain = isFromChain ? fromAssetOrChain.chain : fromAssetOrChain.asset;

    const isFromCommonAssetOrChain =
      isFromChain ||
      CommonAssetStrings.includes(assetOrChain as (typeof CommonAssetStrings)[number]);

    const { identifier: unsafeIdentifier, decimal: commonAssetDecimal } = isFromCommonAssetOrChain
      ? getCommonAssetInfo(assetOrChain as CommonAssetString)
      : { identifier: assetOrChain, decimal: undefined };

    const { chain, isSynthetic } = getAssetInfo(unsafeIdentifier);

    const { tax, decimal, identifier } = staticTokensMap.get(
      unsafeIdentifier.toUpperCase() as TokenNames,
    ) || {
      decimal: commonAssetDecimal || BaseDecimal[chain],
      identifier: unsafeIdentifier,
    };

    const adjustedValue = fromBaseDecimal
      ? safeValue(BigInt(parsedValue), fromBaseDecimal)
      : safeValue(parsedValue, decimal);

    const assetValue = asyncTokenLookup
      ? createAssetValue(identifier, fromBaseDecimal ? adjustedValue : parsedValue)
      : isSynthetic
        ? createSyntheticAssetValue(identifier, parsedValue)
        : new AssetValue({ tax, decimal, identifier, value: adjustedValue });

    return assetValue as ConditionalAssetValueReturn<T>;
  }

  static loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: Todo }>(
      (resolve, reject) => {
        try {
          import("@swapkit/tokens").then((tokenPackages) => {
            for (const tokenList of Object.values(tokenPackages)) {
              for (const { identifier, chain, ...rest } of tokenList.tokens) {
                staticTokensMap.set(identifier.toUpperCase() as TokenNames, {
                  identifier,
                  decimal: "decimals" in rest ? rest.decimals : BaseDecimal[chain as Chain],
                });
              }
            }

            resolve({ ok: true });
          });
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

  /**
   * @deprecated use AssetValue.from({ asset, value, asyncTokenLookup: true })
   */
  static fromString(asset: string, value: NumberPrimitives = 0) {
    return AssetValue.from({ asset, value, asyncTokenLookup: true });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value, asyncTokenLookup: true })
   */
  static fromIdentifier(
    asset: `${Chain}.${string}` | `${Chain}/${string}` | TokenNames,
    value: NumberPrimitives = 0,
  ) {
    return AssetValue.from({ asset: asset as TokenNames, value, asyncTokenLookup: true });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value })
   */
  static fromStringSync(asset: string, value: NumberPrimitives = 0) {
    return AssetValue.from({ asset, value });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value, fromBaseDecimal, asyncTokenLookup: true })
   */
  static fromStringWithBase(
    asset: string,
    value: string | bigint = 0n,
    fromBaseDecimal: number = BaseDecimal.THOR,
  ) {
    return AssetValue.from({ asyncTokenLookup: true, asset, value, fromBaseDecimal });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value, fromBaseDecimal, asyncTokenLookup: true })
   */
  static fromStringWithBaseSync(
    asset: string,
    value: string | bigint = 0n,
    fromBaseDecimal: number = BaseDecimal.THOR,
  ) {
    return AssetValue.from({ asset, value, fromBaseDecimal });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value })
   */
  static fromIdentifierSync(asset: TokenNames, value: NumberPrimitives = 0) {
    return AssetValue.from({ asset, value });
  }
  /**
   * @deprecated use AssetValue.from({ asset, value }) or AssetValue.from({ chain, value })
   */
  static fromChainOrSignature(assetOrChain: CommonAssetString, value: NumberPrimitives = 0) {
    if (assetOrChain in Chain) {
      return AssetValue.from({ chain: assetOrChain as Chain, value });
    }
    return AssetValue.from({ asset: assetOrChain, value });
  }
}

export function getMinAmountByChain(chain: Chain) {
  const asset = AssetValue.from({ chain });

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.Litecoin:
    case Chain.BitcoinCash:
    case Chain.Dash:
      return asset.set(0.00010001);

    case Chain.Dogecoin:
      return asset.set(1.00000001);

    case Chain.Avalanche:
    case Chain.Ethereum:
    case Chain.Arbitrum:
    case Chain.BinanceSmartChain:
      return asset.set(0.00000001);

    case Chain.THORChain:
    case Chain.Maya:
      return asset.set(0);

    case Chain.Cosmos:
    case Chain.Kujira:
      return asset.set(0.000001);

    default:
      return asset.set(0.00000001);
  }
}

async function createAssetValue(identifier: string, value: NumberPrimitives = 0) {
  validateIdentifier(identifier);

  const staticToken = staticTokensMap.get(identifier.toUpperCase() as TokenNames);
  const decimal = staticToken?.decimal || (await getDecimal(getAssetInfo(identifier)));
  if (!staticToken) {
    staticTokensMap.set(identifier.toUpperCase() as TokenNames, { identifier, decimal });
  }

  return new AssetValue({ decimal, value: safeValue(value, decimal), identifier });
}

function createSyntheticAssetValue(identifier: string, value: NumberPrimitives = 0) {
  const [synthChain, symbol] =
    identifier.split(".")?.[0]?.toUpperCase() === Chain.THORChain
      ? identifier.split(".").slice(1).join().split("/")
      : identifier.split("/");

  if (!(synthChain && symbol)) {
    throw new SwapKitError({
      errorKey: "helpers_invalid_asset_identifier",
      info: { identifier },
    });
  }

  return new AssetValue({
    decimal: 8,
    value: safeValue(value, 8),
    identifier: `${Chain.THORChain}.${synthChain}/${symbol}`,
  });
}

function safeValue(value: NumberPrimitives, decimal: number) {
  return typeof value === "bigint"
    ? formatBigIntToSafeValue({ value, bigIntDecimal: decimal, decimal })
    : value;
}

// TODO refactor & split into smaller functions
function getAssetInfo(identifier: string) {
  const isSynthetic = identifier.slice(0, 14).includes("/");

  const isThorchain = identifier.split(".")?.[0]?.toUpperCase() === Chain.THORChain;
  const isMaya = identifier.split(".")?.[0]?.toUpperCase() === Chain.Maya;

  const [synthChain, synthSymbol = ""] =
    isThorchain || isMaya
      ? identifier.split(".").slice(1).join().split("/")
      : identifier.split("/");

  if (isSynthetic && !(synthChain && synthSymbol)) {
    throw new SwapKitError({
      errorKey: "helpers_invalid_asset_identifier",
      info: { identifier },
    });
  }

  const adjustedIdentifier =
    identifier.includes(".") && !isSynthetic
      ? identifier
      : `${isMaya ? Chain.Maya : Chain.THORChain}.${synthSymbol}`;

  const [chain, ...rest] = adjustedIdentifier.split(".") as [Chain, string];

  const symbol = isSynthetic ? synthSymbol : rest.join(".");
  const splitSymbol = symbol.split("-");
  const ticker = (
    splitSymbol.length === 1 ? splitSymbol[0] : splitSymbol.slice(0, -1).join("-")
  ) as string;
  const address = splitSymbol.length === 1 ? undefined : splitSymbol[splitSymbol.length - 1];

  return {
    address: address?.toLowerCase(),
    chain,
    isGasAsset: isGasAsset({ chain, symbol }),
    isSynthetic,
    ticker,
    symbol:
      (isSynthetic ? `${synthChain}/` : "") +
      (address ? `${ticker}-${address?.toLowerCase() ?? ""}` : symbol),
  };
}
