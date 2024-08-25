import {
  Chain,
  type ConnectWalletParams,
  SwapKitError,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";

export const PHANTOM_SUPPORTED_CHAINS = [Chain.Bitcoin, Chain.Solana] as const;
export type PhantomSupportedChains = (typeof PHANTOM_SUPPORTED_CHAINS)[number];

function getPhantomProvider<T extends PhantomSupportedChains>(chain: T) {
  const phantom: NotWorth = window.phantom;
  const provider = chain === Chain.Bitcoin ? phantom?.bitcoin : phantom?.solana;

  if (!provider?.isPhantom) {
    throw new SwapKitError("wallet_phantom_not_found");
  }

  return provider;
}

async function getWalletMethods<T extends PhantomSupportedChains>({
  chain,
}: {
  rpcUrl?: string;
  chain: T;
}) {
  const provider = getPhantomProvider(chain);
  const connection = await provider.connect();
  const address = connection.publicKey.toString();

  switch (chain) {
    case Chain.Bitcoin: {
    }

    case Chain.Solana: {
      const { SOLToolbox } = await import("@swapkit/toolbox-solana");

      return SOLToolbox({ rpcUrl });
    }
  }
}

function connectPhantom({ addChain, config: { thorswapApiKey }, rpcUrls }: ConnectWalletParams) {
  return async function connectPhantom(
    chainOrChains: typeof PHANTOM_SUPPORTED_CHAINS | (typeof PHANTOM_SUPPORTED_CHAINS)[number],
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    try {
      const singleChain = typeof chainOrChains === "string";

      if (singleChain) {
        const connection = await provider.connect();
        const address = connection.publicKey.toString();

        const { SOLToolbox } = await import("@swapkit/toolbox-solana");

        const walletMethods = SOLToolbox({ rpcUrl: rpcUrls[chain] });

        addChain({
          ...walletMethods,
          chain,
          address,
          walletType: WalletOption.PHANTOM,
          balance: [],
          transfer: console.log,
        });

        return true;
      }
    } catch (_) {
      throw new SwapKitError("wallet_connection_rejected_by_user");
    }
  };
}

export const phantomWallet = { connectPhantom } as const;
