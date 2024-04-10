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

function connectOkx({
  addChain,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey, blockchairApiKey },
}: ConnectWalletParams) {
  return async function connectOkx(chains: (typeof OKX_SUPPORTED_CHAINS)[number][]) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
        blockchairApiKey,
      });

      addChain({
        ...walletMethods,
        chain,
        balance: [],
        walletType: WalletOption.OKX,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const okxWallet = { connectOkx } as const;
