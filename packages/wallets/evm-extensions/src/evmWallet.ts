import type { EVMChain, EVMWalletOptions } from '@swapkit/types';
import { WalletOption } from '@swapkit/types';

import { getWalletForType } from './helpers.ts';
import type { EVMWalletConfig } from './types.ts';

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
      const { getWeb3WalletMethods } = await import('@swapkit/toolbox-evm');
      const { BrowserProvider } = await import('ethers');
      const web3provider = new BrowserProvider(getWalletForType(walletType), 'any');
      await web3provider.send('eth_requestAccounts', []);
      const address = await (await web3provider.getSigner()).getAddress();

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
};
