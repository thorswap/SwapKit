import { SwapKitCore } from '@swapkit/core';
import type { ExtendParams } from '@swapkit/types';
import { evmWallet } from '@swapkit/wallet-evm-extensions';
import { keplrWallet } from '@swapkit/wallet-keplr';
import { keystoreWallet } from '@swapkit/wallet-keystore';
import { ledgerWallet } from '@swapkit/wallet-ledger';
import { okxWallet } from '@swapkit/wallet-okx';
import { trezorWallet } from '@swapkit/wallet-trezor';
import { walletconnectWallet } from '@swapkit/wallet-wc';
import { xdefiWallet } from '@swapkit/wallet-xdefi';

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
      keplrWallet,
      keystoreWallet,
      ledgerWallet,
      okxWallet,
      trezorWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  return swapKitClient;
};
