import Fuse from "fuse.js";
import { AssetValue, SwapKitNumber } from "..";
import { BaseDecimal, Chain } from "../types/chains";
import { MemoType } from "../types/sdk";

export type ThornameRegisterParam = {
  name: string;
  chain: string;
  address: string;
  owner?: string;
  preferredAsset?: string;
  expiryBlock?: string;
};

type WithChain<T extends {}> = T & { chain: Chain };

export type MemoOptions<T extends MemoType> = {
  [MemoType.BOND]: { address: string };
  [MemoType.LEAVE]: { address: string };
  [MemoType.CLOSE_LOAN]: { address: string; asset: string; minAmount?: string };
  [MemoType.OPEN_LOAN]: { address: string; asset: string; minAmount?: string };
  [MemoType.UNBOND]: { address: string; unbondAmount: number };
  [MemoType.DEPOSIT]: WithChain<{ symbol: string; address?: string; singleSide?: boolean }>;
  [MemoType.WITHDRAW]: WithChain<{
    ticker: string;
    symbol: string;
    basisPoints: number;
    targetAssetString?: string;
    singleSide?: boolean;
  }>;
  [MemoType.THORNAME_REGISTER]: Omit<ThornameRegisterParam, "preferredAsset" | "expiryBlock">;
  [MemoType.SWAP]: {
    asset?: AssetValue;
    address?: string;
    limit?: SwapKitNumber;
    ssInterval?: number;
    ssQuantity?: number;
    affiliateAddress?: string;
    affiliateFee?: string;
    dexAggAddress?: string;
    dexAggAsset?: string;
    dexAggLimit?: string;
  };
}[T];

export const getMemoFor = <T extends MemoType>(memoType: T, options: MemoOptions<T>) => {
  switch (memoType) {
    case MemoType.LEAVE:
    case MemoType.BOND: {
      const { address } = options as MemoOptions<MemoType.BOND>;
      return `${memoType}:${address}`;
    }

    case MemoType.SWAP: {
      const {
        asset,
        address,
        limit,
        ssInterval,
        ssQuantity,
        affiliateAddress,
        affiliateFee,
        dexAggAddress,
        dexAggAsset,
      } = options as MemoOptions<MemoType.SWAP>;

      const limitWithSS = limit
        ? `${limit}/${ssInterval ? `${ssInterval}` : ""}/${ssQuantity ? `${ssQuantity}` : ""}`
        : "";
      return `${asset?.toString()}:${address}:${limitWithSS}:${
        affiliateAddress ? `${affiliateAddress}` : ""
      }:${affiliateFee ? `${affiliateFee}` : ""}:${dexAggAddress ? `${dexAggAddress}` : ""}:${
        dexAggAsset ? `${dexAggAsset}` : ""
      }`;
    }

    case MemoType.UNBOND: {
      const { address, unbondAmount } = options as MemoOptions<MemoType.UNBOND>;
      return `${memoType}:${address}:${unbondAmount}`;
    }

    case MemoType.THORNAME_REGISTER: {
      const { name, chain, address, owner } = options as MemoOptions<MemoType.THORNAME_REGISTER>;
      return `${memoType}:${name}:${chain}:${address}${owner ? `:${owner}` : ""}`;
    }

    case MemoType.DEPOSIT: {
      const { chain, symbol, address, singleSide } = options as MemoOptions<MemoType.DEPOSIT>;

      const getPoolIdentifier = (chain: Chain, symbol: string): string => {
        switch (chain) {
          case Chain.Litecoin:
            return "l";
          case Chain.Dogecoin:
            return "d";
          case Chain.BitcoinCash:
            return "c";
          default:
            return `${chain}.${symbol}`;
        }
      };

      return singleSide
        ? `${memoType}:${chain}/${symbol}`
        : `${memoType}:${getPoolIdentifier(chain, symbol)}:${address || ""}`;
    }

    case MemoType.WITHDRAW: {
      const { chain, ticker, symbol, basisPoints, targetAssetString, singleSide } =
        options as MemoOptions<MemoType.WITHDRAW>;

      const shortenedSymbol =
        chain === "ETH" && ticker !== "ETH" ? `${ticker}-${symbol.slice(-3)}` : symbol;
      const target = !singleSide && targetAssetString ? `:${targetAssetString}` : "";
      const assetDivider = singleSide ? "/" : ".";

      return `${memoType}:${chain}${assetDivider}${shortenedSymbol}:${basisPoints}${target}`;
    }

    case MemoType.OPEN_LOAN:
    case MemoType.CLOSE_LOAN: {
      const { asset, address } = options as MemoOptions<MemoType.OPEN_LOAN>;

      return `${memoType}:${asset}:${address}`; //:${minAmount ? `${minAmount}` : ''}:t:0`;
    }

    default:
      return "";
  }
};

export async function parseMemo(memo: string) {
  const memoParts = memo.split(":");
  const [actionPartUnparsed] = memoParts;

  if (!actionPartUnparsed) throw new Error("No memo action found");

  const memoAction = parseMemoAction(actionPartUnparsed);

  switch (memoAction) {
    case MemoType.BOND:
      return parseBondMemo(memo);
    case MemoType.UNBOND:
      return parseUnbondMemo(memo);
    case MemoType.LEAVE:
      return parseLeaveMemo(memo);
    case MemoType.CLOSE_LOAN:
      return parseCloseLoanMemo(memo);
    case MemoType.OPEN_LOAN:
      return parseOpenLoanMemo(memo);
    case MemoType.WITHDRAW:
      return parseWithdrawMemo(memo);
    case MemoType.DEPOSIT:
      return parseDepositMemo(memo);
    case MemoType.SWAP:
      return await parseSwapMemo(memo);
    default:
      throw new Error("Unknown memo action");
  }
}

// parseMemoAction('=')
// parseMemoAction('SWAP')
// MemoType.SWAP
const parseMemoAction = (action: string): MemoType | undefined => {
  for (const [key, value] of Object.values(MemoType)) {
    if (key?.toLowerCase() === action.toLowerCase()) {
      return MemoType[key as keyof typeof MemoType];
    }

    if (value?.toLowerCase() === action.toLowerCase()) {
      return MemoType[value as keyof typeof MemoType];
    }
  }

  // If no match is found, return undefined
  return undefined;
};

const parseAssetPart = (asset?: string): AssetValue | undefined => {
  if (!asset) return undefined;

  return AssetValue.fromStringSync(asset);
};

const parseLimitPart = (
  limit?: string,
): { limit?: SwapKitNumber; blockInterval?: number; parts?: number } => {
  if (!limit) return { limit: undefined, blockInterval: undefined, parts: undefined };

  const limitParts = limit.split("/");
  const parsedLimit = SwapKitNumber.fromBigInt(BigInt(limit), BaseDecimal.THOR);
  const blockInterval = limitParts[1] ? Number.parseInt(limitParts[1]) : undefined;
  const parts = limitParts[2] ? Number.parseInt(limitParts[2]) : undefined;

  return { limit: parsedLimit, blockInterval, parts };
};

export enum AGG_CONTRACT_ADDRESS {
  // AVAX
  PANGOLIN = "0x942c6dA485FD6cEf255853ef83a149d43A73F18a",
  AVAX_GENERIC = "0x7C38b8B2efF28511ECc14a621e263857Fb5771d3",
  AVAX_WOOFI = "0x5505BE604dFA8A1ad402A71f8A357fba47F9bf5a",
  AVAX_TRADER_JOE = "0x3b7DbdD635B99cEa39D3d95Dbd0217F05e55B212",

  // BSC
  BSC_GENERIC = "0xB6fA6f1DcD686F4A573Fd243a6FABb4ba36Ba98c",
  BSC_PANCAKE_V2 = "0x30912B38618D3D37De3191A4FFE982C65a9aEC2E",

  // ETH
  ETH_GENERIC = "0xd31f7e39afECEc4855fecc51b693F9A0Cec49fd2",
  UNISWAP_V2 = "0x86904Eb2b3c743400D03f929F2246EfA80B91215",
  SUSHISWAP = "0xbf365e79aA44A2164DA135100C57FDB6635ae870",
  UNISWAP_V3_100 = "0xBd68cBe6c247e2c3a0e36B8F0e24964914f26Ee8",
  UNISWAP_V3_500 = "0xe4ddca21881bac219af7f217703db0475d2a9f02",
  UNISWAP_V3_3000 = "0x11733abf0cdb43298f7e949c930188451a9a9ef2",
  UNISWAP_V3_10000 = "0xb33874810e5395eb49d8bd7e912631db115d5a03",
  UNISWAP_V2_LEG = "0x3660dE6C56cFD31998397652941ECe42118375DA",
}
// Fuzzy match dexAggAddress to final 3 chars of contracts
const parseDexAggAddress = (dexAggUniqueChars?: string) => {
  if (!dexAggUniqueChars) return undefined;
  const enumValues = Object.values(AGG_CONTRACT_ADDRESS);

  const contractAddress = enumValues.find((address) =>
    address.toLowerCase().endsWith(dexAggUniqueChars.toLowerCase()),
  );
  return contractAddress;
};

const findTokenByUniqueLastChars = async (uniqueChars: string) => {
  const tokenPackages = await import("@swapkit/tokens");

  const allTokenListTokens = Object.values(tokenPackages).flatMap((tokenList) => [
    ...tokenList.tokens,
  ]);

  const options = {
    useExtendedSearch: true,
    keys: ["address"],
  };

  const fuse = new Fuse(allTokenListTokens, options);

  const item = fuse.search(`${uniqueChars}$`);
  if (!item.length) return undefined;

  return item[0];
};

const parseDexAggAsset = async (dexAggAssetChars?: string) => {
  if (!dexAggAssetChars) return undefined;

  const dexAggAsset = await findTokenByUniqueLastChars(dexAggAssetChars);
  if (!dexAggAsset) return undefined;
  return AssetValue.fromStringSync(dexAggAsset.item.identifier);
};

const parseDexAggLimit = ({ asset, limit }: { asset?: AssetValue; limit?: string }) => {
  if (!asset || !limit) return undefined;
  //18215186313
  // Value is 182151863
  // Exponent is 13
  // Asset base amount -> 182151863 * 10^13

  const valueWithoutExponent = limit.substring(0, limit.length - 2);
  const exponent = limit.substring(limit.length - 2);

  const assetValue = AssetValue.fromStringWithBaseSync(
    asset.toString(),
    BigInt(valueWithoutExponent),
    +exponent,
  );

  return assetValue;
};

export async function parseSwapMemo(memo: string) {
  const [
    _actionPartUnparsed,
    assetPartUnparsed,
    addressPartUnparsed,
    limitPartUnparsed,
    affiliateAddressPartUnparsed,
    affiliateFeePartUnparsed,
    dexAggAddressPartUnparsed,
    dexAggAssetPartUnparsed,
    dexAggLimitPartUnparsed,
  ] = memo.split(":");

  const memoAsset = parseAssetPart(assetPartUnparsed);

  const memoAddress = addressPartUnparsed;
  const { limit, blockInterval, parts } = parseLimitPart(limitPartUnparsed);
  const memoAffiliateAddress = affiliateAddressPartUnparsed;
  const memoAffiliateFee = affiliateFeePartUnparsed;

  // Fuzzy match dexAggAddress to final 3 chars of contracts
  const dexAggAddressParsed = parseDexAggAddress(dexAggAddressPartUnparsed);
  // Fuzzy match dexAggAsset to final 3 chars of contracts
  const dexAggAssetParsed = await parseDexAggAsset(dexAggAssetPartUnparsed);
  // memoAsset?.chainId => ChainId.ETH
  // lookup tokenlist + fuzzy match on 'ec7'
  // => ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7
  const dexAggLimitAssetValue = parseDexAggLimit({
    asset: dexAggAssetParsed,
    limit: dexAggLimitPartUnparsed,
  });

  return {
    asset: memoAsset,
    address: memoAddress,
    limit,
    ssInterval: blockInterval,
    ssQuantity: parts,
    affiliateAddress: memoAffiliateAddress,
    affiliateFee: memoAffiliateFee,
    dexAggAddress: dexAggAddressParsed,
    dexAggAssetValue: dexAggLimitAssetValue?.toString(),
    dexAggLimit: dexAggLimitAssetValue?.getValue("string"),
  };
}

export const parseBondMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed] = memo.split(":");

  return {
    action: MemoType.BOND,
    address: addressPartUnparsed,
  };
};

export const parseUnbondMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, unbondAmountPartUnparsed] = memo.split(":");

  const skNumber = SwapKitNumber.fromBigInt(
    BigInt(unbondAmountPartUnparsed ?? 0),
    BaseDecimal.THOR,
  );
  return {
    action: MemoType.UNBOND,
    address: addressPartUnparsed,
    unbondAmount: skNumber,
  };
};
export const parseLeaveMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed] = memo.split(":");

  return {
    action: MemoType.LEAVE,
    address: addressPartUnparsed,
  };
};

export const parseCloseLoanMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.CLOSE_LOAN,
    address: addressPartUnparsed,
    asset,
  };
};

export const parseOpenLoanMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.OPEN_LOAN,
    address: addressPartUnparsed,
    asset,
  };
};

export const parseWithdrawMemo = (memo: string) => {
  const [_actionPartUnparsed, assetPartUnparsed, basisPoints] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.WITHDRAW,
    asset,
    basisPoints: Number(basisPoints),
  };
};

export const parseDepositMemo = (memo: string) => {
  const [_actionPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.DEPOSIT,
    asset,
  };
};
