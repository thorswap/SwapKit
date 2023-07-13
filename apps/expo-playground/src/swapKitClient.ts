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

  /**
   * NOTE: Test API keys - please use your own API keys in app as those will timeout, reach limits, etc.
   */
  client.extend({
    config: {
      ethplorerApiKey: 'EK-xs8Hj-qG4HbLY-LoAu7',
      covalentApiKey: 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
      utxoApiKey: 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf',
      walletConnectProjectId: 'freekey',
    },
    wallets,
  });

  skClient = client;

  return client;
};
