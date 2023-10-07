import { evmWallet } from '@swapkit/wallet-evm-extensions';
import { keplrWallet } from '@swapkit/wallet-keplr';
import { ledgerWallet } from '@swapkit/wallet-ledger';
import { walletconnectWallet } from '@swapkit/wallet-wc';
import { xdefiWallet } from '@swapkit/wallet-xdefi';
import { keystoreWallet } from '@swapkit/wallet-keystore';
import { SwapKitCore } from '@swapkit/core';
import { trezorWallet } from '@swapkit/wallet-trezor';
import type { ExtendParams } from '@swapkit/types';

export * from '@swapkit/api';
export * from '@swapkit/core';

type SwapKitOptions = Omit<ExtendParams, 'wallets'>;

export const createSwapKit = ({ config, ...extendParams }: SwapKitOptions = {}) => {
  const swapKitClient = new SwapKitCore({ stagenet: config?.stagenet });

  swapKitClient.extend({
    ...extendParams,
    config,
    wallets: [
      evmWallet,
      keystoreWallet,
      ledgerWallet,
      trezorWallet,
      keplrWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  return swapKitClient;
};
