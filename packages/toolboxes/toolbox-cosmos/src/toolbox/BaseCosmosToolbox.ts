import { stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { baseAmount } from '@thorswap-lib/helpers';
import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import { Asset, ChainId, DerivationPath } from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { BaseCosmosToolboxType } from '../thorchainUtils/types/client-types.js';

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
  getSigner: (phrase: string) =>
    DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      prefix: cosmosClientSdk.prefix,
      hdPaths: [stringToPath(`${derivationPath}/0`)],
    }),
  getSignerFromPrivateKey: (privateKey: Uint8Array) =>
    DirectSecp256k1Wallet.fromKey(privateKey, cosmosClientSdk.prefix),
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
