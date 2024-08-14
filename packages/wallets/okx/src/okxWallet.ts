import {
  Chain,
  type ConnectWalletParams,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";

import { getWalletForChain } from "./helpers.ts";

export const OKX_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Base,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.Cosmos,
  Chain.Ethereum,
  Chain.Optimism,
  Chain.Polygon,
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
