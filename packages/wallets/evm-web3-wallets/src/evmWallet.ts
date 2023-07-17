import { Web3Provider } from '@ethersproject/providers';
import { getETHDefaultWallet, getWeb3WalletMethods, isDetected } from '@thorswap-lib/toolbox-evm';
import { EVMChain, EVMWalletOptions, WalletOption } from '@thorswap-lib/types';

import { getWalletForType } from './helpers.js';
import { EVMWalletConfig } from './types.js';

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
      const address = await signer.getAddress();

      const walletMethods = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: getWalletForType(walletType),
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
