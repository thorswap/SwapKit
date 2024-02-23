import type { SwapKitCore } from "@swapkit/core";

let skClient: SwapKitCore | undefined;

export const clearSwapkitClient = () => (skClient = undefined);

export const getSwapKitClient = async ({
  ethplorerApiKey = "freekey",
  covalentApiKey = "",
  utxoApiKey = "",
  blockchairApiKey = "",
  walletConnectProjectId = "",
  stagenet,
}: {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
  blockchairApiKey?: string;
  utxoApiKey?: string;
  walletConnectProjectId?: string;
  stagenet?: boolean;
} = {}) => {
  if (skClient) return skClient;

  const { evmWallet } = await import("@swapkit/wallet-evm-extensions");
  const { keplrWallet } = await import("@swapkit/wallet-keplr");
  const { keystoreWallet } = await import("@swapkit/wallet-keystore");
  const { keepkeyWallet } = await import("@swapkit/wallet-keepkey");
  const { ledgerWallet } = await import("@swapkit/wallet-ledger");
  const { okxWallet } = await import("@swapkit/wallet-okx");
  const { SwapKitCore } = await import("@swapkit/core");
  const { trezorWallet } = await import("@swapkit/wallet-trezor");
  const { walletconnectWallet } = await import("@swapkit/wallet-wc");
  const { xdefiWallet } = await import("@swapkit/wallet-xdefi");

  const client = new SwapKitCore({ stagenet });

  client.extend({
    config: {
      ethplorerApiKey,
      covalentApiKey,
      blockchairApiKey: blockchairApiKey || utxoApiKey,
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
    wallets: [
      xdefiWallet,
      okxWallet,
      ledgerWallet,
      keystoreWallet,
      keepkeyWallet,
      trezorWallet,
      keplrWallet,
      evmWallet,
      walletconnectWallet,
    ],
  });

  skClient = client;

  return client;
};
