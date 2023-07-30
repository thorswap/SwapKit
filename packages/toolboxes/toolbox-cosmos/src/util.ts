import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { assetToString } from '@thorswap-lib/helpers';
import { Asset, ChainId, RPCUrl } from '@thorswap-lib/types';

import { AssetAtom, AssetMuon } from './types.js';

export const getDenom = (asset: Asset) => {
  if (assetToString(asset) === assetToString(AssetAtom)) return 'uatom';
  if (assetToString(asset) === assetToString(AssetMuon)) return 'umuon';
  return asset.symbol;
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

export const getRPC = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.Cosmos:
      return RPCUrl.Cosmos;
    case ChainId.Binance:
      return RPCUrl.Binance;
    case ChainId.THORChain:
      return RPCUrl.THORChain;
    default:
      return RPCUrl.Cosmos;
  }
}
