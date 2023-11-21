import { SwapKitApi } from '@swapkit/api';
import { AssetValue } from '@swapkit/helpers';
import { Chain, type ChainId, type DerivationPath } from '@swapkit/types';

import type { CosmosClient } from '../cosmosClient.ts';
import type { BaseCosmosToolboxType } from '../thorchainUtils/types/client-types.ts';

type Params = {
  client: CosmosClient;
  decimal: number;
  derivationPath: DerivationPath;
};

export const getFeeRateFromThorswap = async (chainId: ChainId) => {
  const response = await SwapKitApi.getGasRates();

  return response.find((gas) => gas.chainId === chainId)?.gas;
};

// TODO: figure out some better way to initialize from base value
export const getAssetFromDenom = async (denom: string, amount: string) => {
  switch (denom) {
    case 'rune':
      return AssetValue.fromChainOrSignature(Chain.THORChain, parseInt(amount) / 1e8);
    case 'bnb':
      return AssetValue.fromChainOrSignature(Chain.Binance, parseInt(amount) / 1e8);
    case 'uatom':
    case 'atom':
      return AssetValue.fromChainOrSignature(Chain.Cosmos, parseInt(amount) / 1e6);
    case 'cacao':
      return AssetValue.fromChainOrSignature(Chain.Maya, parseInt(amount) / 1e10);
    case 'maya':
      return AssetValue.fromChainOrSignature('MAYA.MAYA', parseInt(amount) / 1e4);
    case 'ukuji':
    case 'kuji':
      return AssetValue.fromChainOrSignature(Chain.Kujira, parseInt(amount) / 1e6);

    default:
      return AssetValue.fromString(denom, parseInt(amount) / 1e8);
  }
};

export const BaseCosmosToolbox = ({
  derivationPath,
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
  getBalance: async (address: string, _potentialScamFilter?: boolean) => {
    const denomBalances = await cosmosClient.getBalance(address);
    return await Promise.all(
      denomBalances
        .filter(({ denom }) => denom)
        .map(({ denom, amount }) => getAssetFromDenom(denom, amount)),
    );
  },
});
