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
import { SwapKitNumber, type SwapKitValueType } from "./swapKitNumber.ts";

const staticTokensMap = new Map<
  TokenNames,
  { tax?: TokenTax; decimal: number; identifier: string }
>();

type ConditionalAssetValueReturn<T extends AssetValueFromParams> =
  T["asyncTokenLookup"] extends true ? Promise<AssetValue> : AssetValue;

type AssetIdentifier =
  | {
      asset: TokenNames;
    }
  | {
      asset: string;
    }
  | {
      asset: CommonAssetString;
    }
  | {
      chain: Chain;
    };

type AssetValueFromParams = AssetIdentifier & {
  asyncTokenLookup?: boolean;
  value?: NumberPrimitives | SwapKitValueType;
  decimal?: number;
  adjustDecimals?: number;
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

    const assetString =
      chain === Chain.THORChain && symbol ? `${chain}.${ticker}/${symbol}` : urlAsset;

    return createAssetValue(assetString, value);
  }

  static from<T extends AssetValueFromParams>({
    value = 0,
    decimal: decimalParam,
    adjustDecimals,
    asyncTokenLookup,
    ...assetOrChain
  }: AssetValueFromParams): ConditionalAssetValueReturn<T> {
    const parsedValue = value instanceof BigIntArithmetics ? value.getValue("string") : value;

    // fromChainOrSignature
    const isFromChain = "chain" in assetOrChain;
    const fromChain = isFromChain ? assetOrChain.chain : undefined;
    const fromCommonAsset = isFromChain
      ? fromChain
      : CommonAssetStrings.includes(assetOrChain.asset as (typeof CommonAssetStrings)[number])
        ? (assetOrChain.asset as CommonAssetString)
        : undefined;

    const { identifier: asset, decimal } =
      fromCommonAsset || isFromChain
        ? getCommonAssetInfo(fromCommonAsset as CommonAssetString)
        : {
            identifier: assetOrChain.asset,
            decimal: decimalParam,
          };

    // asynch token lookup
    if (asyncTokenLookup) {
      const shiftedAmount = adjustDecimals
        ? BigIntArithmetics.shiftDecimals({
            value: SwapKitNumber.fromBigInt(BigInt(parsedValue)),
            from: 0,
            to: decimal || BaseDecimal.THOR,
          }).getBaseValue("string")
        : parsedValue;

      return createAssetValue(asset, shiftedAmount) as ConditionalAssetValueReturn<T>;
    }

    const { chain, isSynthetic } = getAssetInfo(asset);

    if (isSynthetic)
      return createSyntheticAssetValue(asset, parsedValue) as ConditionalAssetValueReturn<T>;

    const tokenInfo = staticTokensMap.get(asset.toUpperCase() as TokenNames);

    const {
      tax,
      decimal: assetDecimal,
      identifier,
    } = tokenInfo || {
      decimal: BaseDecimal[chain],
      identifier: asset,
    };

    const adjustedValue = adjustDecimals
      ? safeValue(BigInt(parsedValue), decimal || BaseDecimal.THOR)
      : safeValue(parsedValue, assetDecimal);

    return new AssetValue({
      tax,
      decimal: assetDecimal,
      identifier,
      value: adjustedValue,
    }) as ConditionalAssetValueReturn<T>;
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
}

export function getMinAmountByChain(chain: Chain) {
  const asset = AssetValue.from({ chain });

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

    case Chain.Cosmos:
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
    symbol:
      (isSynthetic ? `${synthChain}/` : "") +
      (address ? `${ticker}-${address?.toLowerCase() ?? ""}` : symbol),
    ticker,
  };
}
