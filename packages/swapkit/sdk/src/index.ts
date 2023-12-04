import { SwapKitCore } from '@coinmasters/core';
import type { ExtendParams } from '@coinmasters/types';
import { evmWallet } from '@coinmasters/wallet-evm-extensions';
import { keplrWallet } from '@coinmasters/wallet-keplr';
import { keystoreWallet } from '@coinmasters/wallet-keystore';
import { keepkeyWallet } from '@coinmasters/wallet-keepkey';
import { ledgerWallet } from '@coinmasters/wallet-ledger';
import { okxWallet } from '@coinmasters/wallet-okx';
import { trezorWallet } from '@coinmasters/wallet-trezor';
import { metamaskWallet } from '@coinmasters/wallet-metamask';
import { walletconnectWallet } from '@coinmasters/wallet-wc';
import { xdefiWallet } from '@coinmasters/wallet-xdefi';

export * from '@coinmasters/api';
export * from '@coinmasters/core';

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
      keepkeyWallet,
      ledgerWallet,
      okxWallet,
      trezorWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  return swapKitClient;
};
