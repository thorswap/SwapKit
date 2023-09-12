import type { SwapKitCore } from '@thorswap-lib/swapkit-core';

let skClient: SwapKitCore | undefined;

export const getSwapKitClient = async ({
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
  if (skClient) return skClient;

  const { evmWallet } = await import('@thorswap-lib/evm-web3-wallets');
  const { keplrWallet } = await import('@thorswap-lib/keplr');
  const { keystoreWallet } = await import('@thorswap-lib/keystore');
  const { ledgerWallet } = await import('@thorswap-lib/ledger');
  const { okxWallet } = await import('@thorswap-lib/okx');
  const { SwapKitCore } = await import('@thorswap-lib/swapkit-core');
  const { trezorWallet } = await import('@thorswap-lib/trezor');
  const { walletconnectWallet } = await import('@thorswap-lib/walletconnect');
  const { xdefiWallet } = await import('@thorswap-lib/xdefi');

  const client = new SwapKitCore({ stagenet });

  client.extend({
    config: {
      ethplorerApiKey,
      covalentApiKey,
      utxoApiKey,
      walletConnectProjectId,
      stagenet,
    },
    wallets: [
      xdefiWallet,
      okxWallet,
      ledgerWallet,
      keystoreWallet,
      trezorWallet,
      keplrWallet,
      evmWallet,
      walletconnectWallet,
    ],
  });

  skClient = client;

  return client;
};
