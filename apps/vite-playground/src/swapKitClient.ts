import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import { evmWallet, xdefiWallet } from '@thorswap-lib/web-extensions';

let skClient: SwapKitCore;
let stagenetClient: SwapKitCore;

export const getSwapKitClient = (stagenet?: boolean) => {
  if (stagenet && stagenetClient) return stagenetClient;
  if (!stagenet && skClient) return skClient;

  const client = new SwapKitCore({ stagenet });

  client.extend({
    config: {
      ethplorerApiKey: 'freekey',
      covalentApiKey: '',
      utxoApiKey: '',
    },
    wallets: [xdefiWallet, evmWallet, ledgerWallet, keystoreWallet, trezorWallet],
  });

  if (stagenet) stagenetClient = client;
  else skClient = client;

  return client;
};
