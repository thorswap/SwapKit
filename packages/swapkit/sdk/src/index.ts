import { SwapKit } from "@swapkit/core";
import { ChainflipPlugin } from "@swapkit/plugin-chainflip";
import { EVMPlugin } from "@swapkit/plugin-evm";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/plugin-thorchain";
import { wallets as defaultWallets } from "@swapkit/wallets";

export * from "@swapkit/core";
export * from "@swapkit/tokens";

const defaultPlugins = {
  ...ChainflipPlugin,
  ...EVMPlugin,
  ...MayachainPlugin,
  ...ThorchainPlugin,
};

type Params<P, W> = Omit<Parameters<typeof SwapKit>[0], "plugins" | "wallets"> & {
  plugins?: P;
  wallets?: W;
};

export const createSwapKit = <
  P extends Partial<typeof defaultPlugins> = typeof defaultPlugins,
  W extends Partial<typeof defaultWallets> = typeof defaultWallets,
>({
  plugins,
  wallets,
  ...extendParams
}: Params<P, W>) => {
  return SwapKit({
    ...extendParams,
    wallets: wallets || defaultWallets,
    plugins: plugins || defaultPlugins,
  });
};
