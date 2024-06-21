import { ChainflipPlugin } from "@swapkit/chainflip";
import { SwapKit } from "@swapkit/core";
import { EVMPlugin } from "@swapkit/evm";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/thorchain";
import { coinbaseWallet } from "@swapkit/wallet-coinbase";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { phantomWallet } from "@swapkit/wallet-phantom";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

export * from "@swapkit/core";
export * from "@swapkit/tokens";

const defaultPlugins = {
  ...ChainflipPlugin,
  ...EVMPlugin,
  ...MayachainPlugin,
  ...ThorchainPlugin,
};

const defaultWallets = {
  ...coinbaseWallet,
  ...evmWallet,
  ...keepkeyWallet,
  ...keplrWallet,
  ...keystoreWallet,
  ...ledgerWallet,
  ...okxWallet,
  ...phantomWallet,
  ...trezorWallet,
  ...walletconnectWallet,
  ...xdefiWallet,
};

type Params<P, W> = Omit<
  Parameters<typeof SwapKit<typeof defaultPlugins, typeof defaultWallets>>[0],
  "wallets" | "plugins"
> & { plugins?: P; wallets?: W };

export const createSwapKit = <
  P extends Partial<typeof defaultPlugins> = typeof defaultPlugins,
  W extends Partial<typeof defaultWallets> = typeof defaultWallets,
>({
  plugins,
  wallets,
  ...extendParams
}: Params<P, W>) => {
  return SwapKit({
    plugins: plugins || defaultPlugins,
    wallets: wallets || defaultWallets,
    ...extendParams,
  });
};
