import { ChainflipPlugin } from "@swapkit/chainflip";
import { SwapKit } from "@swapkit/core";
import { ThorchainPlugin } from "@swapkit/thorchain";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

const clientCache = new Map<string, Todo>();

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

  const client = SwapKit({
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
    plugins: [
      { plugin: ThorchainPlugin },
      { plugin: ChainflipPlugin, config: { brokerEndpoint: "" } },
    ],
    wallets: [
      evmWallet,
      keepkeyWallet,
      keplrWallet,
      keystoreWallet,
      ledgerWallet,
      okxWallet,
      trezorWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  clientCache.set(key, client);

  return client;
};
