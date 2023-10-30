import type { SwapKitCore } from '@swapkit/core';

let skClient: SwapKitCore | undefined;

export const clearSwapkitClient = () => (skClient = undefined);

export const getSwapKitClient = async ({
  ethplorerApiKey = 'freekey',
  covalentApiKey = '',
  utxoApiKey = '',
  blockchairApiKey = '',
  walletConnectProjectId = '',
  stagenet,
}: {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
  blockchairApiKey?: string;
  utxoApiKey?: string;
  walletConnectProjectId?: string;
  stagenet?: boolean;
} = {}) => {
  if (skClient) return skClient;

  const { evmWallet } = await import('@swapkit/wallet-evm-extensions');
  const { keplrWallet } = await import('@swapkit/wallet-keplr');
  const { keystoreWallet } = await import('@swapkit/wallet-keystore');
  const { ledgerWallet } = await import('@swapkit/wallet-ledger');
  const { okxWallet } = await import('@swapkit/wallet-okx');
  const { SwapKitCore } = await import('@swapkit/core');
  const { trezorWallet } = await import('@swapkit/wallet-trezor');
  const { walletconnectWallet } = await import('@swapkit/wallet-wc');
  const { xdefiWallet } = await import('@swapkit/wallet-xdefi');

  const client = new SwapKitCore({ stagenet });

  client.extend({
    config: {
      ethplorerApiKey,
      covalentApiKey,
      blockchairApiKey: blockchairApiKey || utxoApiKey,
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
