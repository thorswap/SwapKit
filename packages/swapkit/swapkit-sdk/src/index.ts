import { evmWallet } from '@thorswap-lib/evm-web3-wallets';
import { keepkeyWallet } from '@thorswap-lib/keepkey';
import { keplrWallet } from '@thorswap-lib/keplr';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import type { ExtendParams } from '@thorswap-lib/types';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';
import { xdefiWallet } from '@thorswap-lib/xdefi';

export * from '@thorswap-lib/swapkit-api';
export * from '@thorswap-lib/swapkit-core';

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
      keepkeyWallet,
      metamaskWallet,
      trezorWallet,
      keplrWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  return swapKitClient;
};
