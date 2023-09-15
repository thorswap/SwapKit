import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import { AssetValue } from '@thorswap-lib/swapkit-helpers';
import type { Asset, ChainId, DerivationPath } from '@thorswap-lib/types';

import type { CosmosClient } from '../cosmosClient.ts';
import type { BaseCosmosToolboxType } from '../thorchainUtils/types/client-types.ts';

type Params = {
  client: CosmosClient;
  getAsset: (asset: string) => Asset | null;
  decimal: number;
  derivationPath: DerivationPath;
};

export const getFeeRateFromThorswap = async (chainId: ChainId) => {
  const response = await SwapKitApi.getGasRates();

  return response.find((gas) => gas.chainId === chainId)?.gas;
};

export const BaseCosmosToolbox = ({
  derivationPath,
  getAsset,
  client: cosmosClient,
}: Params): BaseCosmosToolboxType => ({
  transfer: cosmosClient.transfer,
  getSigner: async (phrase: string) => {
    const { DirectSecp256k1HdWallet } = await import('@cosmjs/proto-signing');
    const { stringToPath } = await import('@cosmjs/crypto');

    return DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      prefix: cosmosClient.prefix,
      hdPaths: [stringToPath(`${derivationPath}/0`)],
    });
  },
  getSignerFromPrivateKey: async (privateKey: Uint8Array) => {
    const { DirectSecp256k1Wallet } = await import('@cosmjs/proto-signing');

    return DirectSecp256k1Wallet.fromKey(privateKey, cosmosClient.prefix);
  },

  getAccount: cosmosClient.getAccount,
  validateAddress: (address: string) => cosmosClient.checkAddress(address),
  getAddressFromMnemonic: (phrase: string) =>
    cosmosClient.getAddressFromMnemonic(phrase, `${derivationPath}/0`),
  getPubKeyFromMnemonic: (phrase: string) =>
    cosmosClient.getPubKeyFromMnemonic(phrase, `${derivationPath}/0`),
  getFeeRateFromThorswap,
  getBalance: async (address: string) => {
    const balances = await cosmosClient.getBalance(address);

    return Promise.all(
      balances
        .filter(({ denom }) => denom && getAsset(denom))
        // TODO fix typing
        .map(async ({ denom, amount }) => await AssetValue.fromIdentifier(denom as any, amount)),
    );
  },
});
