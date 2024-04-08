import type { Keplr } from "@keplr-wallet/types";
import { type AssetValue, setRequestClientConfig } from "@swapkit/helpers";
import type { ConnectWalletParams, WalletTxParams } from "@swapkit/helpers";
import { Chain, ChainToChainId, RPCUrl, WalletOption } from "@swapkit/helpers";

declare global {
  interface Window {
    keplr: Keplr;
  }
}

const connectKeplr =
  ({ addChain, config: { thorswapApiKey }, rpcUrls }: ConnectWalletParams) =>
  async (chain: Chain.Cosmos | Chain.Kujira) => {
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

    addChain({
      ...toolbox,
      chain,
      transfer,
      address,
      balance: [],
      walletType: WalletOption.KEPLR,
    });
  };

export const keplrWallet = {
  connectMethodName: "connectKeplr" as const,
  connect: connectKeplr,
};
