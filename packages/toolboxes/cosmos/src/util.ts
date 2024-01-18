import type { OfflineSigner } from '@cosmjs/proto-signing';
import type { SigningStargateClientOptions } from '@cosmjs/stargate';
import { AssetValue } from '@swapkit/helpers';
import { ChainId, FeeOption, RPCUrl } from '@swapkit/types';

import type { CosmosMaxSendableAmountParams } from './types.ts';

export const USK_KUJIRA_FACTORY_DENOM =
  'FACTORY/KUJIRA1QK00H5ATUTPSV900X202PXX42NPJR9THG58DNQPA72F2P7M2LUASE444A7/UUSK';

const headers =
  typeof window !== 'undefined'
    ? ({} as { [key: string]: string })
    : { referer: 'https://sk.thorswap.net', referrer: 'https://sk.thorswap.net' };

export const getDenom = (symbol: string, isThorchain = false) =>
  isThorchain ? symbol.toLowerCase() : symbol;

export const createStargateClient = async (url: string) => {
  const { StargateClient } = await import('@cosmjs/stargate');

  return StargateClient.connect({ url, headers });
};

export const createSigningStargateClient = async (
  url: string,
  signer: any,
  options: SigningStargateClientOptions = {},
) => {
  const { SigningStargateClient, GasPrice } = await import('@cosmjs/stargate');

  return SigningStargateClient.connectWithSigner({ url, headers }, signer, {
    gasPrice: GasPrice.fromString('0.0003uatom'),
    ...options,
  });
};

export const createOfflineStargateClient = async (
  wallet: OfflineSigner,
  registry?: SigningStargateClientOptions,
) => {
  const { SigningStargateClient } = await import('@cosmjs/stargate');
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
  const assetEntity = typeof asset === 'string' ? await AssetValue.fromString(asset) : asset;
  const balances = await toolbox.getBalance(from);
  const balance = balances.find(({ symbol, chain }) =>
    asset
      ? symbol === assetEntity?.symbol
      : symbol === AssetValue.fromChainOrSignature(chain).symbol,
  );

  const fees = await toolbox.getFees();

  if (!balance) return AssetValue.fromChainOrSignature(assetEntity?.chain || balances[0]?.chain, 0);

  return balance.sub(fees[feeOptionKey]);
};
