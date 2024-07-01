import { SwapKit } from "@swapkit/core";
import { ChainflipPlugin } from "@swapkit/plugin-chainflip";
import { EVMPlugin } from "@swapkit/plugin-evm";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/plugin-thorchain";
import { coinbaseWallet } from "@swapkit/wallet-coinbase";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { exodusWallet } from "@swapkit/wallet-exodus";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { phantomWallet } from "@swapkit/wallet-phantom";
import { radixWallet } from "@swapkit/wallet-radix";
import { talismanWallet } from "@swapkit/wallet-talisman";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

export type SwapKitClient = ReturnType<typeof SwapKit>;

const plugins = {
  ...ChainflipPlugin,
  ...EVMPlugin,
  ...MayachainPlugin,
  ...ThorchainPlugin,
};

const wallets = {
  ...evmWallet,
  ...coinbaseWallet,
  ...exodusWallet,
  ...keepkeyWallet,
  ...keplrWallet,
  ...keystoreWallet,
  ...ledgerWallet,
  ...okxWallet,
  ...phantomWallet,
  ...radixWallet,
  ...talismanWallet,
  ...trezorWallet,
  ...walletconnectWallet,
  ...xdefiWallet,
};

const clientCache = new Map<string, SwapKitClient>();

const swapKitParams = {
  ethplorerApiKey: "freekey",
  covalentApiKey: "",
  blockchairApiKey: "",
  walletConnectProjectId: "",
  stagenet: false,
};

export const getSwapKitClient = () => {
  const key = JSON.stringify(swapKitParams);
  if (clientCache.has(key)) return clientCache.get(key);

  const client = SwapKit({ ...swapKitParams, wallets, plugins });

  clientCache.set(key, client);

  return client;
};
