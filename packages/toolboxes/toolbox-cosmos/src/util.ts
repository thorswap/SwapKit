import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { assetToString, baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { AmountWithBaseDenom, Asset, ChainId, FeeOption, RPCUrl } from '@thorswap-lib/types';

import { AssetAtom, AssetMuon, CosmosMaxSendableAmountParams } from './types.js';

export const getDenom = ({ chain, symbol }: Asset) => {
  const assetString = assetToString({ chain, symbol });

  switch (assetString) {
    case assetToString(AssetAtom):
      return 'uatom';
    case assetToString(AssetMuon):
      return 'umuon';
    default:
      return symbol;
  }
};

export const getAsset = (denom: string) => {
  if (denom === getDenom(AssetAtom)) return AssetAtom;
  if (denom === getDenom(AssetMuon)) return AssetMuon;
  return null;
};

export const createCosmJS = ({ offlineSigner, rpcUrl }: { offlineSigner: any; rpcUrl?: string }) =>
  SigningStargateClient.connectWithSigner(rpcUrl || RPCUrl.Cosmos, offlineSigner, {
    gasPrice: GasPrice.fromString('0.0003uatom'),
  });

export const getRPC = (chainId: ChainId, stagenet?: boolean) => {
  switch (chainId) {
    case ChainId.Cosmos:
      return RPCUrl.Cosmos;
    case ChainId.Binance:
      return RPCUrl.Binance;
    case ChainId.THORChain:
      return stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain;
    default:
      return RPCUrl.Cosmos;
  }
};

export const estimateMaxSendableAmount = async ({
  from,
  toolbox,
  asset,
  feeOptionKey = FeeOption.Fast,
}: CosmosMaxSendableAmountParams): Promise<AmountWithBaseDenom> => {
  const assetEntity = typeof asset === 'string' ? AssetEntity.fromAssetString(asset) : asset;
  const balance = (await toolbox.getBalance(from)).find((balance) =>
    asset
      ? balance.asset.symbol === assetEntity?.symbol
      : balance.asset.symbol === getSignatureAssetFor(balance.asset.chain)?.symbol,
  );

  if (!balance) return baseAmount(0);

  if (assetEntity && getSignatureAssetFor(balance.asset.chain).shallowEq(assetEntity)) {
    return balance.amount;
  }

  const fees = await toolbox.getFees();

  return balance.amount.minus(fees[feeOptionKey]);
};
