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
      ethplorerApiKey: 'EK-uB3Fv-ehKXfyN-Chujs',
      covalentApiKey: 'ckey_dd1785f86616456b8e7c1e6740a',
      utxoApiKey: 'C___DSXrweUGKTv3bucm2FbHLCiBfPNO',
    },
    wallets,
  });

  skClient = client;

  return client;
};
