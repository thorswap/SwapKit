import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { xdefiWallet } from '@thorswap-lib/web-extensions';

let skClient: SwapKitCore;

export const getSwapKitClient = () => {
  if (skClient) return skClient;

  const client = new SwapKitCore();

  client.extend({
    config: {
      ethplorerApiKey: 'freekey',
      covalentApiKey: 'freekey',
      utxoApiKey: 'freekey',
    },
    wallets: [xdefiWallet],
  });

  skClient = client;

  return client;
};
