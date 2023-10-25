import { AssetValue } from '@swapkit/helpers';
import { ChainId, FeeOption, RPCUrl } from '@swapkit/types';

import type { CosmosMaxSendableAmountParams } from './types.ts';

export const getDenom = (symbol: string, isThorchain = false) =>
  isThorchain ? symbol.toLowerCase() : symbol;

export const createCosmJS = async ({
  offlineSigner,
  rpcUrl,
}: {
  offlineSigner: any;
  rpcUrl?: string;
}) => {
  const { SigningStargateClient, GasPrice } = await import('@cosmjs/stargate');
  return SigningStargateClient.connectWithSigner(rpcUrl || RPCUrl.Cosmos, offlineSigner, {
    gasPrice: GasPrice.fromString('0.0003uatom'),
  });
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

  return balance.sub(fees[feeOptionKey].value);
};
