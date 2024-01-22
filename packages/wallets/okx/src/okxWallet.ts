import { setRequestClientConfig } from '@swapkit/helpers';
import { Chain, type ConnectWalletParams, WalletOption } from '@swapkit/types';

import { getWalletForChain } from './helpers.ts';

const OKX_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.Cosmos,
] as const;

const connectOkx =
  ({
    addChain,
    config: { thorswapApiKey, covalentApiKey, ethplorerApiKey, utxoApiKey, blockchairApiKey },
  }: ConnectWalletParams) =>
  async (chains: (typeof OKX_SUPPORTED_CHAINS)[number][]) => {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
        blockchairApiKey: blockchairApiKey || utxoApiKey,
      });

      addChain({
        chain,
        walletMethods,
        wallet: { address: walletMethods.getAddress(), balance: [], walletType: WalletOption.OKX },
      });
    });

    await Promise.all(promises);
  };

export const okxWallet = {
  connectMethodName: 'connectOkx' as const,
  connect: connectOkx,
};
