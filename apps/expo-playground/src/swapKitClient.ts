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
      require('@thorswap-lib/web-extensions').xdefiWallet,
      require('@thorswap-lib/web-extensions').evmWallet,
      require('@thorswap-lib/walletconnect').walletconnectWallet,
      require('@thorswap-lib/trustwallet').trustwalletWallet,
    ],
  });

  client.extend({
    config: {
      ethplorerApiKey: 'freekey',
      covalentApiKey: 'freekey',
      utxoApiKey: 'freekey',
    },
    wallets,
  });

  skClient = client;

  return client;
};
