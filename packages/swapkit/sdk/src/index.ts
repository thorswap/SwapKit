import { ChainflipPlugin } from "@swapkit/chainflip";
import { SwapKit } from "@swapkit/core";
import { EVMPlugin } from "@swapkit/plugin-evm";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/thorchain";
import { coinbaseWallet } from "@swapkit/wallet-coinbase";
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
export * from "@swapkit/tokens";

const defaultPlugins = {
  ...ThorchainPlugin,
  ...MayachainPlugin,
  ...EVMPlugin,
  ...ChainflipPlugin,
};

const defaultWallets = {
  ...coinbaseWallet,
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
  Parameters<typeof SwapKit<typeof defaultPlugins, typeof defaultWallets>>[0],
  "wallets" | "plugins"
>;

export const createSwapKit = <
  P extends Partial<typeof defaultPlugins>,
  W extends Partial<typeof defaultWallets>,
>({
  config,
  plugins,
  wallets,
  ...extendParams
}: Params & {
  plugins?: P;
  wallets?: W;
}) => {
  const swapKitClient = SwapKit({
    config,
    plugins: plugins || defaultPlugins,
    wallets: wallets || defaultWallets,
    ...extendParams,
  });

  return swapKitClient;
};
