import type { CoinbaseWalletSDKOptions } from "@coinbase/wallet-sdk/dist/CoinbaseWalletSDK.js";
import { setRequestClientConfig } from "@swapkit/helpers";
import { Chain, type ConnectWalletParams, WalletOption } from "@swapkit/helpers";

import { getWalletForChain } from "./signer.js";

export const COINBASE_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Base,
  Chain.BinanceSmartChain,
  Chain.Ethereum,
  Chain.Optimism,
  Chain.Polygon,
] as const;

function connectCoinbaseWallet({
  addChain,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey },
  coinbaseWalletSettings,
}: ConnectWalletParams & { coinbaseWalletSettings?: CoinbaseWalletSDKOptions }) {
  return async function connectCoinbaseWallet(
    chains: (typeof COINBASE_SUPPORTED_CHAINS)[number][],
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const walletMethods = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
        coinbaseWalletSettings,
      });

      addChain({ ...walletMethods, balance: [], chain, walletType: WalletOption.COINBASE_MOBILE });
    });

    await Promise.all(promises);

    return true;
  };
}

export const coinbaseWallet = { connectCoinbaseWallet } as const;
