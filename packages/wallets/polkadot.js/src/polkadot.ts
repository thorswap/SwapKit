import {
  Chain,
  type ConnectWalletParams,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { getWalletForChain } from "./helpers";

const POLKADOT_SUPPORTED_CHAINS = [Chain.Polkadot] as const;

function connectPolkadotJs({
  addChain,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey },
}: ConnectWalletParams) {
  return async function connectPolkadotJs(chains: (typeof POLKADOT_SUPPORTED_CHAINS)[number][]) {
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
        walletType: WalletOption.POLKADOT_JS,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const polkadotWallet = { connectPolkadotJs } as const;
