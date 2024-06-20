import {
  Chain,
  type ConnectWalletParams,
  SwapKitError,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";

function getPhantomProvider() {
  return window.phantom?.solana;
}

function connectPhantom({ addChain, config: { thorswapApiKey }, rpcUrls }: ConnectWalletParams) {
  return async function connectPhantom(chain: Chain = Chain.Solana) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const provider = getPhantomProvider();

    if (provider?.isPhantom) {
      try {
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
      } catch (_) {
        throw new SwapKitError("wallet_connection_rejected_by_user");
      }
    }

    throw new SwapKitError("wallet_phantom_not_found");
  };
}

export const phantomWallet = { connectPhantom } as const;
