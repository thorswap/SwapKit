import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import { evmWallet, xdefiWallet } from '@thorswap-lib/web-extensions';

let skClient: SwapKitCore;

export const getSwapKitClient = () => {
  if (skClient) return skClient;

  const client = new SwapKitCore();

  client.extend({
    config: {
      ethplorerApiKey: 'freekey',
      covalentApiKey: '',
      utxoApiKey: 'freekey',
    },
    wallets: [xdefiWallet, evmWallet, ledgerWallet, keystoreWallet, trezorWallet],
  });

  skClient = client;

  return client;
};
