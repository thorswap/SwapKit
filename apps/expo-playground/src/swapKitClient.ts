import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Platform } from 'react-native';

let skClient: SwapKitCore;

export const getSwapKitClient = () => {
  if (skClient) return skClient;

  const client = new SwapKitCore();

  const wallets = Platform.select({
    default: [require('@thorswap-lib/keystore').keystoreWallet],
    web: [
      require('@thorswap-lib/keystore').keystoreWallet,
      require('@thorswap-lib/xdefi').xdefiWallet,
      require('@thorswap-lib/walletconnect').walletconnectWallet,
    ],
  });

  client.extend({
    config: {
      ethplorerApiKey: 'freekey',
      covalentApiKey: 'freekey',
      walletConnectProjectId: 'freekey',
      utxoApiKey: undefined,
    },
    wallets,
  });

  skClient = client;

  return client;
};
