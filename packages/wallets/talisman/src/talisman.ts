import {
  Chain,
  type ConnectWalletParams,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { getWalletForChain } from "./helpers";

const TALISMAN_SUPPORTED_CHAINS = [
  Chain.Ethereum,
  Chain.Arbitrum,
  Chain.Polygon,
  Chain.BinanceSmartChain,
  Chain.Optimism,
  Chain.Polkadot,
] as const;

function connectTalisman({
  addChain,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey },
}: ConnectWalletParams) {
  return async function connectTalisman(chains: (typeof TALISMAN_SUPPORTED_CHAINS)[number][]) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const { address, walletMethods } = await getWalletForChain({
        chain,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({
        address,
        ...walletMethods,
        chain,
        balance: [],
        walletType: WalletOption.TALISMAN,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const talismanWallet = { connectTalisman } as const;
