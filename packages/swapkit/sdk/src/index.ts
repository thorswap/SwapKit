import { ChainflipPlugin } from "@swapkit/chainflip";
import { SwapKit } from "@swapkit/core";
import { EVMPlugin } from "@swapkit/plugin-evm";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/thorchain";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

export * from "@swapkit/core";

const plugins = { ...ThorchainPlugin, ...ChainflipPlugin, ...MayachainPlugin, ...EVMPlugin };

const wallets = {
  ...evmWallet,
  ...keplrWallet,
  ...keystoreWallet,
  ...keepkeyWallet,
  ...ledgerWallet,
  ...okxWallet,
  ...trezorWallet,
  ...walletconnectWallet,
  ...xdefiWallet,
};

type Params = Omit<
  Parameters<typeof SwapKit<typeof plugins, typeof wallets>>[0],
  "wallets" | "plugins"
>;

export const createSwapKit = ({ config, ...extendParams }: Params) => {
  const swapKitClient = SwapKit({ config, plugins, wallets, ...extendParams });

  return swapKitClient;
};
