import { ChainflipPlugin } from "@swapkit/chainflip";
import type { ExtendParams } from "@swapkit/core";
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

export * from "@swapkit/core";

type SwapKitOptions = Omit<ExtendParams, "wallets">;

export const createSwapKit = ({ config, ...extendParams }: SwapKitOptions = {}) => {
  const swapKitClient = SwapKit({
    config,
    plugins: { ...ThorchainPlugin, ...ChainflipPlugin },
    wallets: {
      ...evmWallet,
      ...keplrWallet,
      ...keystoreWallet,
      ...keepkeyWallet,
      ...ledgerWallet,
      ...okxWallet,
      ...trezorWallet,
      ...walletconnectWallet,
      ...xdefiWallet,
    },
    ...extendParams,
  });

  return swapKitClient;
};
