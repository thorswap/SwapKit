import { ChainflipProvider } from "@swapkit/chainflip";
import { SwapKit } from "@swapkit/core";
import { ThorchainProvider } from "@swapkit/thorchain";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

const clientCache = new Map<string, ReturnType<typeof SwapKit>>();

export const getSwapKitClient = (
  params: {
    ethplorerApiKey?: string;
    covalentApiKey?: string;
    blockchairApiKey?: string;
    walletConnectProjectId?: string;
    stagenet?: boolean;
  } = {},
) => {
  const key = JSON.stringify(params);

  const {
    ethplorerApiKey = "freekey",
    covalentApiKey = "",
    blockchairApiKey = "",
    walletConnectProjectId = "",
    stagenet = false,
  } = params;

  if (clientCache.has(key)) {
    return clientCache.get(key);
  }

  const client = SwapKit<{
    thorchain: ReturnType<typeof ThorchainProvider>["methods"];
    chainflip: ReturnType<typeof ChainflipProvider>["methods"];
  }>({
    apis: {},
    rpcUrls: {},
    stagenet,
    config: {
      ethplorerApiKey,
      covalentApiKey,
      blockchairApiKey,
      walletConnectProjectId,
      stagenet,
      keepkeyConfig: {
        apiKey: localStorage.getItem("keepkeyApiKey") || "1234",
        pairingInfo: {
          name: "swapKit-demo-app",
          imageUrl:
            "https://repository-images.githubusercontent.com/587472295/feec8a61-39b2-4615-b293-145e97f49b5a",
          basePath: "http://localhost:1646/spec/swagger.json",
          url: "http://localhost:1646",
        },
      },
    },
    // @ts-expect-error
    plugins: [ThorchainProvider, ChainflipProvider],
    wallets: [
      // @ts-expect-error
      xdefiWallet,
      // @ts-expect-error
      okxWallet,
      // @ts-expect-error
      ledgerWallet,
      // @ts-expect-error
      keystoreWallet,
      // @ts-expect-error
      keepkeyWallet,
      // @ts-expect-error
      trezorWallet,
      // @ts-expect-error
      keplrWallet,
      // @ts-expect-error
      evmWallet,
      // @ts-expect-error
      walletconnectWallet,
    ],
  });

  clientCache.set(key, client);

  return client;
};
