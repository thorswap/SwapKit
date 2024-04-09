import type { ExtendParams } from "@swapkit/core";
import { SwapKit } from "@swapkit/core";
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
    wallets: [
      // @ts-expect-error
      evmWallet,
      // @ts-expect-error
      keplrWallet,
      // @ts-expect-error
      keystoreWallet,
      // @ts-expect-error
      keepkeyWallet,
      // @ts-expect-error
      ledgerWallet,
      // @ts-expect-error
      okxWallet,
      // @ts-expect-error
      trezorWallet,
      // @ts-expect-error
      walletconnectWallet,
      // @ts-expect-error
      xdefiWallet,
    ],
    ...extendParams,
  });

  return swapKitClient;
};
