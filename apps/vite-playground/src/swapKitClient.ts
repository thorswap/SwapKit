import { evmWallet } from '@thorswap-lib/evm-web3-wallets';
import { keplrWallet } from '@thorswap-lib/keplr';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import { xdefiWallet } from '@thorswap-lib/xdefi';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';

export const getSwapKitClient = ({
  ethplorerApiKey = 'freekey',
  covalentApiKey = '',
  utxoApiKey = '',
  walletConnectProjectId = '',
  stagenet,
}: {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
  utxoApiKey?: string;
  walletConnectProjectId?: string;
  stagenet?: boolean;
} = {}) => {
  const client = new SwapKitCore({ stagenet });

  client.extend({
    config: { ethplorerApiKey, covalentApiKey, utxoApiKey, walletConnectProjectId },
    wallets: [xdefiWallet, ledgerWallet, keystoreWallet, trezorWallet, keplrWallet, evmWallet, walletconnectWallet],
  });

  return client;
};
