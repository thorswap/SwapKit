import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { AssetValue, getCommonAssetInfo, SwapKitNumber } from '@thorswap-lib/swapkit-helpers';
import { ChainId, FeeOption, RPCUrl } from '@thorswap-lib/types';

import type { CosmosMaxSendableAmountParams } from './types.ts';
import { AssetAtom, AssetMuon } from './types.ts';

export const getDenom = (symbol: string) => `u${symbol.toLowerCase()}`;

export const getAsset = (denom: string) => {
  if (denom === getDenom(AssetAtom.symbol)) return AssetAtom;
  if (denom === getDenom(AssetMuon.symbol)) return AssetMuon;
  return null;
};

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
}: CosmosMaxSendableAmountParams): Promise<SwapKitNumber | AssetValue> => {
  // fix typing
  const assetEntity =
    typeof asset === 'string' ? await AssetValue.fromIdentifier(asset as any) : asset;
  const balance = (await toolbox.getBalance(from)).find((balance) =>
    asset
      ? balance.symbol === assetEntity?.symbol
      : balance.symbol ===
        AssetValue.fromIdentifierSync(getCommonAssetInfo(balance.chain).identifier).symbol,
  );

  if (!balance) return new SwapKitNumber(0);

  // TODO - what are we doing with this
  if (!getSignatureAssetFor(balance.chain).shallowEq(assetEntity as any)) {
    return balance;
  }

  const fees = await toolbox.getFees();

  return balance.sub(fees[feeOptionKey].value);
};
