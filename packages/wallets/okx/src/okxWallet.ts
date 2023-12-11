import { Chain, WalletOption } from '@swapkit/types';

import { getWalletForChain } from './helpers.ts';
import type { OKXConfig } from './types.ts';

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
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey, blockchairApiKey },
  }: {
    addChain: any;
    config: OKXConfig;
  }) =>
  async (chains: (typeof OKX_SUPPORTED_CHAINS)[number][]) => {
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
