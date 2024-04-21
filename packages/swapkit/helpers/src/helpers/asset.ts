import { RequestClient } from "../modules/requestClient.ts";
import { BaseDecimal, Chain, ChainToRPC, type EVMChain, EVMChains } from "../types/chains.ts";
import type { TokenNames } from "../types/tokens.ts";

const getDecimalMethodHex = "0x313ce567";

export type CommonAssetString =
  | `${Chain.Maya}.MAYA`
  | `${Chain.Ethereum}.THOR`
  | `${Chain.Ethereum}.vTHOR`
  | `${Chain.Kujira}.USK`
  | Chain;

const getContractDecimals = async ({ chain, to }: { chain: EVMChain; to: string }) => {
  try {
    const { result } = await RequestClient.post<{ result: string }>(ChainToRPC[chain], {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      body: JSON.stringify({
        id: 44,
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to: to.toLowerCase(), data: getDecimalMethodHex }, "latest"],
      }),
    });

    return Number.parseInt(BigInt(result || BaseDecimal[chain]).toString());
  } catch (error) {
    console.error(error);
    return BaseDecimal[chain];
  }
};

const getETHAssetDecimal = (symbol: string) => {
  if (symbol === Chain.Ethereum) return BaseDecimal.ETH;
  const splitSymbol = symbol.split("-");
  const address = splitSymbol.length === 1 ? undefined : splitSymbol[splitSymbol.length - 1];

  return address?.startsWith("0x")
    ? getContractDecimals({ chain: Chain.Ethereum, to: address })
    : BaseDecimal.ETH;
};

const getAVAXAssetDecimal = (symbol: string) => {
  const splitSymbol = symbol.split("-");
  const address = splitSymbol.length === 1 ? undefined : splitSymbol[splitSymbol.length - 1];

  return address?.startsWith("0x")
    ? getContractDecimals({ chain: Chain.Avalanche, to: address.toLowerCase() })
    : BaseDecimal.AVAX;
};

const getBSCAssetDecimal = (symbol: string) => {
  if (symbol === Chain.BinanceSmartChain) return BaseDecimal.BSC;

  return BaseDecimal.BSC;
};

export const getDecimal = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Ethereum:
      return getETHAssetDecimal(symbol);
    case Chain.Avalanche:
      return getAVAXAssetDecimal(symbol);
    case Chain.BinanceSmartChain:
      return getBSCAssetDecimal(symbol);
    default:
      return BaseDecimal[chain];
  }
};

export const isGasAsset = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Arbitrum:
    case Chain.Optimism:
      return symbol === "ETH";
    case Chain.Maya:
      return symbol === "CACAO";
    case Chain.Kujira:
      return symbol === "KUJI";
    case Chain.Cosmos:
      return symbol === "ATOM";
    case Chain.Polygon:
      return symbol === "MATIC";
    case Chain.BinanceSmartChain:
      return symbol === "BNB";
    case Chain.THORChain:
      return symbol === "RUNE";

    default:
      return symbol === chain;
  }
};

export const getCommonAssetInfo = (
  assetString: CommonAssetString,
): { identifier: string; decimal: number } => {
  switch (assetString) {
    case `${Chain.Ethereum}.THOR`:
      return { identifier: "ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044", decimal: 18 };
    case `${Chain.Ethereum}.vTHOR`:
      return { identifier: "ETH.vTHOR-0x815c23eca83261b6ec689b60cc4a58b54bc24d8d", decimal: 18 };
    case Chain.Arbitrum:
      return { identifier: `${Chain.Arbitrum}.ETH`, decimal: BaseDecimal[assetString] };
    case Chain.Optimism:
      return { identifier: `${Chain.Optimism}.ETH`, decimal: BaseDecimal[assetString] };
    case Chain.Cosmos:
      return { identifier: "GAIA.ATOM", decimal: BaseDecimal[assetString] };
    case Chain.THORChain:
      return { identifier: "THOR.RUNE", decimal: BaseDecimal[assetString] };
    case Chain.BinanceSmartChain:
      return { identifier: "BSC.BNB", decimal: BaseDecimal[assetString] };
    case Chain.Maya:
      return { identifier: "MAYA.CACAO", decimal: BaseDecimal.MAYA };
    case `${Chain.Maya}.MAYA`:
      return { identifier: "MAYA.MAYA", decimal: 4 };

    case `${Chain.Kujira}.USK`:
      return { identifier: `${Chain.Kujira}.USK`, decimal: 6 };

    default:
      return { identifier: `${assetString}.${assetString}`, decimal: BaseDecimal[assetString] };
  }
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor
export const getAssetType = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  if (symbol.includes("/")) return "Synth";

  switch (chain) {
    case Chain.Cosmos:
      return symbol === "ATOM" ? "Native" : Chain.Cosmos;
    case Chain.Kujira:
      return symbol === Chain.Kujira ? "Native" : Chain.Kujira;
    case Chain.Binance:
      return symbol === Chain.Binance ? "Native" : "BEP2";
    case Chain.BinanceSmartChain:
      return symbol === Chain.Binance ? "Native" : "BEP20";
    case Chain.Ethereum:
      return symbol === Chain.Ethereum ? "Native" : "ERC20";
    case Chain.Avalanche:
      return symbol === Chain.Avalanche ? "Native" : Chain.Avalanche;
    case Chain.Polygon:
      return symbol === Chain.Polygon ? "Native" : "POLYGON";

    case Chain.Arbitrum:
      return [Chain.Ethereum, Chain.Arbitrum].includes(symbol as Chain) ? "Native" : "ARBITRUM";
    case Chain.Optimism:
      return [Chain.Ethereum, Chain.Optimism].includes(symbol as Chain) ? "Native" : "OPTIMISM";

    default:
      return "Native";
  }
};

export const assetFromString = (assetString: string) => {
  const [chain, ...symbolArray] = assetString.split(".") as [Chain, ...(string | undefined)[]];
  const synth = assetString.includes("/");
  const symbol = symbolArray.join(".");
  const splitSymbol = symbol?.split("-");
  const ticker = splitSymbol?.length
    ? splitSymbol.length === 1
      ? splitSymbol[0]
      : splitSymbol.slice(0, -1).join("-")
    : undefined;

  return { chain, symbol, ticker, synth };
};

const potentialScamRegex = new RegExp(
  /(.)\1{6}|\.ORG|\.NET|\.FINANCE|\.COM|WWW|HTTP|\\\\|\/\/|[\s$%:[\]]/,
  "gmi",
);

const evmAssetHasAddress = (assetString: string) => {
  const [chain, symbol] = assetString.split(".") as [EVMChain, string];
  if (!EVMChains.includes(chain as EVMChain)) return true;
  const splitSymbol = symbol.split("-");
  const address = splitSymbol.length === 1 ? undefined : splitSymbol[splitSymbol.length - 1];

  return isGasAsset({ chain: chain as Chain, symbol }) || !!address;
};

export const filterAssets = (
  tokens: {
    value: string;
    decimal: number;
    chain: Chain;
    symbol: string;
  }[],
) =>
  tokens.filter(({ chain, value, symbol }) => {
    const assetString = `${chain}.${symbol}`;

    return (
      !potentialScamRegex.test(assetString) && evmAssetHasAddress(assetString) && value !== "0"
    );
  });

export async function findAssetBy(
  params: { chain: EVMChain; contract: string } | { identifier: `${Chain}.${string}` },
) {
  const tokenPackages = await import("@swapkit/tokens");

  for (const tokenList of Object.values(tokenPackages)) {
    for (const { identifier, chain: tokenChain, ...rest } of tokenList.tokens) {
      if ("identifier" in params && identifier === params.identifier) {
        return identifier as TokenNames;
      }

      if (
        "address" in rest &&
        "chain" in params &&
        tokenChain === params.chain &&
        rest.address.toLowerCase() === params.contract.toLowerCase()
      )
        return identifier as TokenNames;
    }
  }

  return;
}
