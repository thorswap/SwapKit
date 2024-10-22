import type { OfflineSigner } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  type SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import {
  AssetValue,
  Chain,
  ChainId,
  type CosmosChain,
  FeeOption,
  RPCUrl,
  defaultRequestHeaders,
} from "@swapkit/helpers";

import type { CosmosMaxSendableAmountParams } from "./types";

export const USK_KUJIRA_FACTORY_DENOM =
  "FACTORY/KUJIRA1QK00H5ATUTPSV900X202PXX42NPJR9THG58DNQPA72F2P7M2LUASE444A7/UUSK";

export const YUM_KUJIRA_FACTORY_DENOM =
  "FACTORY/KUJIRA1YGFXN0ER40KLCNCK8THLTUPRDXLCK6WVNPKF2K/UYUM";

export const DEFAULT_COSMOS_FEE_MAINNET = {
  amount: [{ denom: "uatom", amount: "500" }],
  gas: "200000",
};

export const getDefaultChainFee = (chain: CosmosChain) => {
  switch (chain) {
    case Chain.Maya:
      return { amount: [], gas: "10000000000" };
    case Chain.THORChain:
      return { amount: [], gas: "500000000" };
    default:
      return DEFAULT_COSMOS_FEE_MAINNET;
  }
};

export const getDenom = (symbol: string, isThorchain = false) => {
  if (isThorchain) {
    return symbol.toLowerCase();
  }

  switch (symbol) {
    case "uUSK":
    case "USK":
      return USK_KUJIRA_FACTORY_DENOM;
    case "uYUM":
    case "YUM":
      return YUM_KUJIRA_FACTORY_DENOM;
    case "uKUJI":
    case "KUJI":
      return "ukuji";
    case "ATOM":
    case "uATOM":
      return "uatom";
    default:
      return symbol;
  }
};

export const getDenomWithChain = ({ symbol, chain }: AssetValue) => {
  if (chain === Chain.Maya) {
    return (symbol.toUpperCase() !== "CACAO" ? symbol : `${Chain.Maya}.${symbol}`).toUpperCase();
  }

  if (chain === Chain.THORChain) {
    return (
      symbol.toUpperCase() !== "RUNE" ? symbol : `${Chain.THORChain}.${symbol}`
    ).toUpperCase();
  }

  if (chain === Chain.Kujira) {
    return (symbol.toUpperCase() !== "KUJI" ? symbol : `${Chain.Kujira}.${symbol}`).toUpperCase();
  }

  if (chain === Chain.Cosmos) {
    return (symbol.toUpperCase() !== "ATOM" ? symbol : `${Chain.Cosmos}.${symbol}`).toUpperCase();
  }

  throw new Error("Unsupported chain");
};

export const createStargateClient = (url: string) => {
  return StargateClient.connect({ url, headers: defaultRequestHeaders });
};

export const createSigningStargateClient = (
  url: string,
  signer: any,
  optionsOrBaseGas: string | SigningStargateClientOptions = {},
) => {
  const gasPrice = typeof optionsOrBaseGas === "string" ? optionsOrBaseGas : "0.0003uatom";
  const options = typeof optionsOrBaseGas === "string" ? {} : optionsOrBaseGas;

  return SigningStargateClient.connectWithSigner({ url, headers: defaultRequestHeaders }, signer, {
    gasPrice: GasPrice.fromString(gasPrice),
    ...options,
  });
};

export const createOfflineStargateClient = (
  wallet: OfflineSigner,
  registry?: SigningStargateClientOptions,
) => {
  return SigningStargateClient.offline(wallet, registry);
};

export const getRPC = (chainId: ChainId, stagenet?: boolean) => {
  switch (chainId) {
    case ChainId.Cosmos:
      return RPCUrl.Cosmos;
    case ChainId.Kujira:
      return RPCUrl.Kujira;

    case ChainId.THORChain:
    case "thorchain-mainnet-v1" as ChainId:
      return stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain;
    case ChainId.Maya:
      return stagenet ? RPCUrl.MayaStagenet : RPCUrl.Maya;

    default:
      return RPCUrl.Cosmos;
  }
};

export const estimateMaxSendableAmount = async ({
  from,
  toolbox,
  asset,
  feeOptionKey = FeeOption.Fast,
}: CosmosMaxSendableAmountParams): Promise<AssetValue> => {
  const assetEntity =
    typeof asset === "string" ? await AssetValue.from({ asyncTokenLookup: true, asset }) : asset;
  const balances = await toolbox.getBalance(from);
  const balance = balances.find(({ symbol, chain }) =>
    asset ? symbol === assetEntity?.symbol : symbol === AssetValue.from({ chain }).symbol,
  );

  const fees = await toolbox.getFees();

  if (!balance) {
    return AssetValue.from({ chain: assetEntity?.chain || balances[0]?.chain || Chain.Cosmos });
  }

  return balance.sub(fees[feeOptionKey]);
};
