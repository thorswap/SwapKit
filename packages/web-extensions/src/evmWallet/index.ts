import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { getETHDefaultWallet, getProvider, isDetected } from '@thorswap-lib/toolbox-evm';
import { Chain, EVMChain, EVMWalletOptions, WalletOption } from '@thorswap-lib/types';

import { EVMWalletConfig } from '../types.js';

import { getWalletForType } from './helpers.js';
import {
  avalancheWalletMethods,
  binanceSmartChainWalletMethods,
  ethereumWalletMethods,
} from './walletMethods.js';

const getWalletMethodsForChain = ({
  chain,
  covalentApiKey,
  ethplorerApiKey,
  signer,
  provider,
}: {
  chain: EVMChain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  signer: Signer;
  provider: Web3Provider;
}) => {
  switch (chain) {
    case Chain.Avalanche:
      if (!covalentApiKey) throw new Error('Covalent API key not found');
      return avalancheWalletMethods({ covalentApiKey, signer, provider });
    case Chain.BinanceSmartChain:
      if (!covalentApiKey) throw new Error('Covalent API key not found');
      return binanceSmartChainWalletMethods({ covalentApiKey, signer, provider });
    case Chain.Ethereum:
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');
      return ethereumWalletMethods({ ethplorerApiKey, signer, provider });
    default:
      throw new Error('EVM chain not supported');
  }
};

const connectEVMWallet =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey },
  }: {
    addChain: any;
    config: EVMWalletConfig;
  }) =>
  async (chains: EVMChain[], walletType: EVMWalletOptions = WalletOption.METAMASK) => {
    const promises = chains.map(async (chain) => {
      const web3provider = new Web3Provider(getWalletForType(walletType), 'any');
      await web3provider.send('eth_requestAccounts', []);
      const signer = web3provider.getSigner();
      const provider = getProvider(chain);
      const address = await signer.getAddress();

      if (!provider) throw new Error('EVM wallet not found');

      const walletMethods = await getWalletMethodsForChain({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        signer,
        provider: web3provider,
      });

      addChain({
        chain,
        walletMethods: { ...walletMethods, getAddress: () => address },
        wallet: { address, balance: [], walletType },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const evmWallet = {
  connectMethodName: 'connectEVMWallet' as const,
  connect: connectEVMWallet,
  isDetected,
  getETHDefaultWallet,
};
