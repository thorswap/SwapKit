import { evmWallet } from '@thorswap-lib/evm-web3-wallets';
import { keplrWallet } from '@thorswap-lib/keplr';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import { ExtendParams } from '@thorswap-lib/types';
import { xdefiWallet } from '@thorswap-lib/xdefi';

export * from '@thorswap-lib/swapkit-api';
export * from '@thorswap-lib/swapkit-core';

type SwapKitOptions = Omit<ExtendParams, 'wallets'>;

export const createSwapKit = ({ config, ...extendParams }: SwapKitOptions = {}) => {
  const swapKitClient = new SwapKitCore({ stagenet: config?.stagenet });

  swapKitClient.extend({
    ...extendParams,
    config,
    wallets: [evmWallet, keystoreWallet, ledgerWallet, trezorWallet, keplrWallet, walletconnectWallet, xdefiWallet],
  });

  return swapKitClient;
};
