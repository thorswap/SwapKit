import type { Keplr } from "@keplr-wallet/types";
import {
  type AssetValue,
  Chain,
  ChainId,
  ChainToChainId,
  type ConnectWalletParams,
  RPCUrl,
  WalletOption,
  type WalletTxParams,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { chainRegistry } from "./chainRegistry";

declare global {
  interface Window {
    keplr: Keplr;
  }
}

const keplrSupportedChainIds = [ChainId.Cosmos];

function connectKeplr({ addChain, config: { thorswapApiKey }, rpcUrls }: ConnectWalletParams) {
  return async function connectKeplr(chains: (Chain.Cosmos | Chain.Kujira)[]) {
    setRequestClientConfig({ apiKey: thorswapApiKey });
    const keplrClient = window.keplr;

    const toolboxPromises = chains.map(async (chain) => {
      const chainId = ChainToChainId[chain];
      if (!keplrSupportedChainIds.includes(chainId)) {
        const chainConfig = chainRegistry.get(chainId);
        if (!chainConfig) throw new Error(`Unsupported chain ${chain}`);
        await keplrClient.experimentalSuggestChain(chainConfig);
      }

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

        const { transactionHash } = await cosmJS.sendTokens(address, recipient, coins, 2, memo);
        return transactionHash;
      };

      const toolbox = getToolboxByChain(chain)();

      addChain({
        ...toolbox,
        chain,
        transfer,
        address,
        balance: [],
        walletType: WalletOption.KEPLR,
      });
    });

    await Promise.all(toolboxPromises);

    return true;
  };
}

export const keplrWallet = { connectKeplr } as const;
