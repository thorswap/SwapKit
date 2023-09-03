import { Web3Provider } from '@ethersproject/providers';
import type { EVMChain, EVMWalletOptions } from '@thorswap-lib/types';
import { WalletOption } from '@thorswap-lib/types';

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
      const { getWeb3WalletMethods } = await import('@thorswap-lib/toolbox-evm');
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
};
