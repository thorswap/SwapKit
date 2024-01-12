import type { Eip1193Provider } from '@swapkit/toolbox-evm';
import type { ConnectWalletParams, EVMChain, EVMWalletOptions } from '@swapkit/types';
import { WalletOption } from '@swapkit/types';

declare global {
  interface Window {
    ethereum: Eip1193Provider;
    trustwallet: Eip1193Provider;
    coinbaseWalletExtension: Eip1193Provider;
    xfi?: {
      binance: any;
      bitcoin: any;
      bitcoincash: any;
      dogecoin: any;
      ethereum: Eip1193Provider;
      litecoin: any;
      thorchain: any;
    };
  }
}

const getWalletForType = (
  walletType:
    | WalletOption.BRAVE
    | WalletOption.OKX_MOBILE
    | WalletOption.METAMASK
    | WalletOption.TRUSTWALLET_WEB
    | WalletOption.COINBASE_WEB,
) => {
  switch (walletType) {
    case WalletOption.BRAVE:
    case WalletOption.METAMASK:
    case WalletOption.OKX_MOBILE:
      return window.ethereum;
    case WalletOption.COINBASE_WEB:
      return window.coinbaseWalletExtension;
    case WalletOption.TRUSTWALLET_WEB:
      return window.trustwallet;
  }
};

const connectEVMWallet =
  ({ addChain, config: { covalentApiKey, ethplorerApiKey } }: ConnectWalletParams) =>
  async (chains: EVMChain[], walletType: EVMWalletOptions = WalletOption.METAMASK) => {
    const promises = chains.map(async (chain) => {
      const { BrowserProvider, getWeb3WalletMethods, getProvider } = await import(
        '@swapkit/toolbox-evm'
      );
      const web3provider = new BrowserProvider(getWalletForType(walletType), 'any');
      await web3provider.send('eth_requestAccounts', []);
      const address = await (await web3provider.getSigner()).getAddress();

      const walletMethods = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: getWalletForType(walletType),
      });

      const getBalance = async (potentialScamFilter: boolean = true) =>
        walletMethods.getBalance(address, potentialScamFilter, getProvider(chain));

      addChain({
        chain,
        walletMethods: { ...walletMethods, getAddress: () => address, getBalance },
        wallet: { address, balance: [], walletType },
      });
    });

    await Promise.all(promises);
  };

export const evmWallet = {
  connectMethodName: 'connectEVMWallet' as const,
  connect: connectEVMWallet,
};
