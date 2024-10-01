import type { Keplr } from "@keplr-wallet/types";
import {
  type AssetValue,
  type Chain,
  ChainId,
  ChainToChainId,
  type ConnectWalletParams,
  WalletOption,
  type WalletTxParams,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { chainRegistry } from "./chainRegistry";

declare global {
  interface Window {
    keplr: Keplr;
    leap: Keplr;
  }
}

const keplrSupportedChainIds = [ChainId.Cosmos];

type TransferParams = WalletTxParams & { assetValue: AssetValue };

function connectKeplr({
  addChain,
  config: { thorswapApiKey },
}: ConnectWalletParams<{
  transfer: (params: TransferParams) => Promise<string>;
}>) {
  return async function connectKeplr(
    chains: (Chain.Cosmos | Chain.Kujira)[],
    extensionKey: "keplr" | "leap" = "keplr",
  ) {
    const walletType = extensionKey === "keplr" ? WalletOption.KEPLR : WalletOption.LEAP;
    setRequestClientConfig({ apiKey: thorswapApiKey });
    const keplrClient = window[extensionKey];

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
      const { getToolboxByChain } = await import("@swapkit/toolbox-cosmos");

      const accounts = await offlineSigner.getAccounts();

      if (!accounts?.[0]?.address) throw new Error("No accounts found");
      const [{ address }] = accounts;

      const toolbox = getToolboxByChain(chain)();

      const transfer = (params: {
        from?: string;
        recipient: string;
        assetValue: AssetValue;
        memo?: string;
      }) =>
        toolbox.transfer({
          ...params,
          signer: offlineSigner,
          fee: 2,
          from: params.from || address,
        });

      addChain({
        ...toolbox,
        chain,
        transfer,
        address,
        balance: [],
        walletType,
      });
    });

    await Promise.all(toolboxPromises);

    return true;
  };
}

export const keplrWallet = { connectKeplr } as const;
