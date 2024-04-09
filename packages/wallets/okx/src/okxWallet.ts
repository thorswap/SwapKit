import {
  Chain,
  type ConnectWalletParams,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";

import { getWalletForChain } from "./helpers.ts";

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
    config: { thorswapApiKey, covalentApiKey, ethplorerApiKey, blockchairApiKey },
  }: ConnectWalletParams) =>
  async (chains: (typeof OKX_SUPPORTED_CHAINS)[number][]) => {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
        blockchairApiKey,
      });

      addChain({
        chain,
        ...walletMethods,
        balance: [],
        walletType: WalletOption.OKX,
      });
    });

    await Promise.all(promises);
  };

export const okxWallet = {
  connectMethodName: "connectOkx" as const,
  connect: connectOkx,
};
