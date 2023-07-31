import { baseAmount } from '@thorswap-lib/helpers';
import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import { Asset, ChainId, DerivationPath } from '@thorswap-lib/types';
import { stringToPath } from '@cosmjs/crypto';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { BaseCosmosToolboxType } from '../thorchainUtils/types/client-types.js';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

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
  getSigner: async (phrase: string) => {
    return DirectSecp256k1HdWallet.fromMnemonic(phrase, { prefix: cosmosClientSdk.prefix, hdPaths: [stringToPath(`${DerivationPath.THOR}/0`)] });
  },
  getAccount: cosmosClientSdk.getAccount,
  validateAddress: (address: string) => cosmosClientSdk.checkAddress(address),
  getAddressFromMnemonic: (phrase: string) =>
    cosmosClientSdk.getAddressFromMnemonic(phrase, `${derivationPath}/0`),
  getFeeRateFromThorswap,
  getBalance: async (address: string) => {
    const balances = await cosmosClientSdk.getBalance(address);

    return balances
      .filter(({ denom }) => denom && getAsset(denom))
      .map(({ denom, amount }) => ({
        asset: getAsset(denom) as Asset,
        amount: baseAmount(amount, decimal),
      }));
  },
});
