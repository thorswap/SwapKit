import { stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { baseAmount } from '@thorswap-lib/helpers';
import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import { Asset, ChainId, DerivationPath } from '@thorswap-lib/types';

import { CosmosClient } from '../cosmosClient.js';
import { BaseCosmosToolboxType } from '../thorchainUtils/types/client-types.js';

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
  decimal,
  derivationPath,
  getAsset,
  client: cosmosClient,
}: Params): BaseCosmosToolboxType => ({
  transfer: cosmosClient.transfer,
  getSigner: (phrase: string) =>
    DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      prefix: cosmosClient.prefix,
      hdPaths: [stringToPath(`${derivationPath}/0`)],
    }),
  getSignerFromPrivateKey: (privateKey: Uint8Array) =>
    DirectSecp256k1Wallet.fromKey(privateKey, cosmosClient.prefix),
  getAccount: cosmosClient.getAccount,
  validateAddress: (address: string) => cosmosClient.checkAddress(address),
  getAddressFromMnemonic: (phrase: string) =>
    cosmosClient.getAddressFromMnemonic(phrase, `${derivationPath}/0`),
  getPubKeyFromMnemonic: (phrase: string) =>
    cosmosClient.getPubKeyFromMnemonic(phrase, `${derivationPath}/0`),
  getFeeRateFromThorswap,
  getBalance: async (address: string) => {
    const balances = await cosmosClient.getBalance(address);

    return balances
      .filter(({ denom }) => denom && getAsset(denom))
      .map(({ denom, amount }) => ({
        asset: getAsset(denom) as Asset,
        amount: baseAmount(amount, decimal),
      }));
  },
});
