import { SwapKit, type SwapKitParams } from "@swapkit/core";
import { ChainflipPlugin } from "@swapkit/plugin-chainflip";
import { EVMPlugin } from "@swapkit/plugin-evm";
import { RadixPlugin } from "@swapkit/plugin-radix";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/plugin-thorchain";
import { wallets as defaultWallets } from "@swapkit/wallets";

export * from "@swapkit/core";
export * from "@swapkit/tokens";

const defaultPlugins = {
  ...ChainflipPlugin,
  ...EVMPlugin,
  ...MayachainPlugin,
  ...ThorchainPlugin,
  ...RadixPlugin,
};

export const createSwapKit = <P extends typeof defaultPlugins, W extends typeof defaultWallets>({
  plugins,
  wallets,
  ...extendParams
}: SwapKitParams<P, W> = {}) => {
  return SwapKit({
    ...extendParams,
    wallets: wallets || defaultWallets,
    plugins: plugins || defaultPlugins,
  });
};

export { SwapKitApi } from "@swapkit/api";
