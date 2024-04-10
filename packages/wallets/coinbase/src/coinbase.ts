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

function connectCoinbaseWallet({
  addChain,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey },
}: ConnectWalletParams) {
  return async function connectCoinbaseWallet(
    chains: (typeof COINBASE_SUPPORTED_CHAINS)[number][],
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({ ...walletMethods, balance: [], chain, walletType: WalletOption.COINBASE_MOBILE });
    });

    await Promise.all(promises);

    return true;
  };
}

export const coinbaseWallet = { connectCoinbaseWallet } as const;
