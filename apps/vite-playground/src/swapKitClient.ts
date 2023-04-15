import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
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
    wallets: [xdefiWallet, evmWallet, ledgerWallet],
  });

  skClient = client;

  return client;
};
