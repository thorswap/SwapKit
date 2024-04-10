import type { Keplr } from "@keplr-wallet/types";
import {
  type AssetValue,
  Chain,
  ChainToChainId,
  type ConnectWalletParams,
  RPCUrl,
  WalletOption,
  type WalletTxParams,
  setRequestClientConfig,
} from "@swapkit/helpers";

declare global {
  interface Window {
    keplr: Keplr;
  }
}

function connectKeplr({ addChain, config: { thorswapApiKey }, rpcUrls }: ConnectWalletParams) {
  return async function connectKeplr(chains: (Chain.Cosmos | Chain.Kujira)[]) {
    const chain = chains[0] || Chain.Cosmos;
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const keplrClient = window.keplr;
    const chainId = ChainToChainId[chain];
    keplrClient?.enable(chainId);
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(chainId);
    if (!offlineSigner) throw new Error("Could not load offlineSigner");
    const { getToolboxByChain, getDenom, createSigningStargateClient } = await import(
      "@swapkit/toolbox-cosmos"
    );

    const cosmJS = await createSigningStargateClient(
      rpcUrls[chain] || RPCUrl.Cosmos,
      offlineSigner,
    );

    const accounts = await offlineSigner.getAccounts();

    if (!accounts?.[0]?.address) throw new Error("No accounts found");
    const [{ address }] = accounts;

    const transfer = async ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) => {
      const coins = [
        {
          denom: chain === Chain.Cosmos ? "uatom" : getDenom(assetValue.symbol),
          amount: assetValue.getBaseValue("string"),
        },
      ];

      const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 1.6, memo);
      return transactionHash;
    };

    const toolbox = getToolboxByChain(chain);

    addChain({ ...toolbox, chain, transfer, address, balance: [], walletType: WalletOption.KEPLR });

    return true;
  };
}

export const keplrWallet = { connectKeplr } as const;
