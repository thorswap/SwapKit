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
  FeeOption,
  RPCUrl,
  defaultRequestHeaders,
} from "@swapkit/helpers";

import type { CosmosMaxSendableAmountParams } from "./types.ts";

export const USK_KUJIRA_FACTORY_DENOM =
  "FACTORY/KUJIRA1QK00H5ATUTPSV900X202PXX42NPJR9THG58DNQPA72F2P7M2LUASE444A7/UUSK";

export const YUM_KUJIRA_FACTORY_DENOM =
  "FACTORY/KUJIRA1YGFXN0ER40KLCNCK8THLTUPRDXLCK6WVNPKF2K/UYUM";

export const DEFAULT_COSMOS_FEE_MAINNET = {
  amount: [{ denom: "uatom", amount: "500" }],
  gas: "200000",
};

export const getDenom = (symbol: string, isThorchain = false) => {
  if (isThorchain) {
    return symbol.toLowerCase();
  }
  switch (symbol) {
    case "uUSK":
      return USK_KUJIRA_FACTORY_DENOM;
    case "uYUM":
      return YUM_KUJIRA_FACTORY_DENOM;
    default:
      return symbol;
  }
};

export const createStargateClient = (url: string) => {
  return StargateClient.connect({ url, headers: defaultRequestHeaders });
};

export const createSigningStargateClient = (
  url: string,
  signer: Todo,
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
    case ChainId.Binance:
      return RPCUrl.Binance;
    case ChainId.Kujira:
      return RPCUrl.Kujira;

    case ChainId.THORChain:
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
  const assetEntity = typeof asset === "string" ? await AssetValue.fromString(asset) : asset;
  const balances = await toolbox.getBalance(from);
  const balance = balances.find(({ symbol, chain }) =>
    asset
      ? symbol === assetEntity?.symbol
      : symbol === AssetValue.fromChainOrSignature(chain).symbol,
  );

  const fees = await toolbox.getFees();

  if (!balance) {
    return AssetValue.fromChainOrSignature(
      assetEntity?.chain || balances[0]?.chain || Chain.Cosmos,
      0,
    );
  }

  return balance.sub(fees[feeOptionKey]);
};
