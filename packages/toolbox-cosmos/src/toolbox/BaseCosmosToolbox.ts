import type { proto } from '@cosmos-client/core';
import { assetToString, baseAmount } from '@thorswap-lib/helpers';
import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import { Asset, ChainId, DerivationPath } from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { BaseCosmosToolboxType } from '../index.js';

type Params = {
  sdk: CosmosSDKClient;
  getAsset: (asset: string) => Asset | null;
  decimal: number;
  derivationPath: DerivationPath;
};

export const getFeeRateFromThorswap = async (chainId: ChainId) => {
  const response = await SwapKitApi.getGasRates();

  return response.find((gas) => gas.chainId === chainId)?.gas;
};

export const BaseCosmosToolbox = ({
  decimal,
  derivationPath,
  getAsset,
  sdk: cosmosClientSdk,
}: Params): BaseCosmosToolboxType => ({
  sdk: cosmosClientSdk.sdk,
  transfer: cosmosClientSdk.transfer,
  buildSendTxBody: cosmosClientSdk.buildSendTxBody,
  signAndBroadcast: cosmosClientSdk.signAndBroadcast,
  getAccount: cosmosClientSdk.getAccount,
  validateAddress: (address: string) => cosmosClientSdk.checkAddress(address),
  createKeyPair: (phrase: string): proto.cosmos.crypto.secp256k1.PrivKey =>
    cosmosClientSdk.getPrivKeyFromMnemonic(phrase, `${derivationPath}/0`),
  getAddressFromMnemonic: (phrase: string) =>
    cosmosClientSdk.getAddressFromMnemonic(phrase, `${derivationPath}/0`),
  getFeeRateFromThorswap,
  getBalance: async (address: string, filterAssets?: Asset[]) => {
    const balances = await cosmosClientSdk.getBalance(address);
    return balances
      .filter(({ denom }) => denom && getAsset(denom))
      .map(({ denom, amount }) => ({
        asset: getAsset(denom) as Asset,
        amount: baseAmount(amount, decimal),
      }))
      .filter(
        ({ asset }) =>
          !filterAssets ||
          filterAssets.filter(
            (filteredAsset) => assetToString(asset) === assetToString(filteredAsset),
          ).length,
      );
  },
});
