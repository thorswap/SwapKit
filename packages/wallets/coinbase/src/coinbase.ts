import { setRequestClientConfig } from "@swapkit/helpers";
import { Chain, type ConnectWalletParams, WalletOption } from "@swapkit/helpers";

import { getWalletForChain } from "./signer.js";

const COINBASE_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Ethereum,
] as const;

const connectCoinbase =
  ({
    addChain,
    config: { thorswapApiKey, covalentApiKey, ethplorerApiKey },
  }: ConnectWalletParams) =>
  async (chains: (typeof COINBASE_SUPPORTED_CHAINS)[number][]) => {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({
        chain,
        ...walletMethods,
        balance: [],
        walletType: WalletOption.COINBASE_MOBILE,
      });
    });

    await Promise.all(promises);
  };

export const coinbaseWallet = { connectCoinbase } as const;
