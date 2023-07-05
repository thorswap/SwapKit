import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { ExtendParams } from '@thorswap-lib/types';

export * from '@thorswap-lib/swapkit-core';

type SwapKitOptions = Omit<ExtendParams, 'wallets'> & {
  swapkitConfig?: {
    stagenet?: boolean;
  };
};

export const createSwapKit = async ({ swapkitConfig, ...extendParams }: SwapKitOptions = {}) => {
  const { evmWallet } = await import('@thorswap-lib/evm-web3-wallets');
  const { keplrWallet } = await import('@thorswap-lib/keplr');
  const { keystoreWallet } = await import('@thorswap-lib/keystore');
  const { ledgerWallet } = await import('@thorswap-lib/ledger');
  const { trezorWallet } = await import('@thorswap-lib/trezor');
  const { xdefiWallet } = await import('@thorswap-lib/xdefi');

  const swapKitClient = new SwapKitCore(swapkitConfig);

  swapKitClient.extend({
    ...extendParams,
    wallets: [
      evmWallet,
      keystoreWallet,
      ledgerWallet,
      trezorWallet,
      keplrWallet,
      xdefiWallet,
    ],
  });

  return swapKitClient;
};
