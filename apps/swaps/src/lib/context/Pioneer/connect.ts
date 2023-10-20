import { WalletOption } from '@coinmasters/types';

import { availableChainsByWallet } from './support';

// const TAG = " | connectWallets | ";
export async function initializeWallets() {
  // const tag = `${TAG} | initializeWallets | `;
  const wallets: any = [];
  const walletsVerbose: any = [];

  // Importing wallets

  const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
  // const { evmWallet } = await import("@coinmasters/evm-web3-wallets");
  const { keplrWallet } = await import('@coinmasters/wallet-keplr');
  const { keystoreWallet } = await import('@coinmasters/wallet-keystore');
  // const { metamaskWallet } = await import("@coinmasters/wallet-metamask");
  const { ledgerWallet } = await import('@coinmasters/wallet-ledger');
  const { okxWallet } = await import('@coinmasters/wallet-okx');
  const { trezorWallet } = await import('@coinmasters/wallet-trezor');
  const { walletconnectWallet } = await import('@coinmasters/wallet-wc');
  const { xdefiWallet } = await import('@coinmasters/wallet-xdefi');

  // Initialize and push each wallet into the wallets array
  const walletKeepKey = {
    type: WalletOption.KEEPKEY,
    icon: 'https://pioneers.dev/coins/keepkey.png',
    chains: availableChainsByWallet[WalletOption.KEEPKEY],
    wallet: keepkeyWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(keepkeyWallet);
  walletsVerbose.push(walletKeepKey);
  // const walletMetaMask = {
  //   type: WalletOption.METAMASK,
  //   icon: "https://pioneers.dev/coins/metamask.png",
  //   chains: availableChainsByWallet[WalletOption.METAMASK],
  //   wallet: metamaskWallet,
  //   status: "offline",
  //   isConnected: false,
  // };
  // wallets.push(metamaskWallet);
  // walletsVerbose.push(walletMetaMask);
  // const walletEVM = {
  //   type: "EVM", // TODO
  //   icon: "https://pioneers.dev/coins/evm.png",
  //   chains: availableChainsByWallet.EVM, // TODO
  //   wallet: evmWallet,
  //   status: "offline",
  //   isConnected: false,
  // };
  // wallets.push(evmWallet);
  // walletsVerbose.push(walletEVM);
  const walletKeplr = {
    type: WalletOption.KEPLR,
    icon: 'https://pioneers.dev/coins/keplr.png',
    chains: availableChainsByWallet[WalletOption.KEPLR],
    wallet: keplrWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(keplrWallet);
  walletsVerbose.push(walletKeplr);
  const walletKeystore = {
    type: WalletOption.KEYSTORE,
    icon: 'https://pioneers.dev/coins/keystore.png',
    chains: availableChainsByWallet[WalletOption.KEYSTORE],
    wallet: keystoreWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(keystoreWallet);
  walletsVerbose.push(walletKeystore);
  const walletLedger = {
    type: WalletOption.LEDGER,
    icon: 'https://pioneers.dev/coins/ledger.png',
    chains: availableChainsByWallet[WalletOption.LEDGER],
    wallet: ledgerWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(ledgerWallet);
  walletsVerbose.push(walletLedger);
  const walletOKX = {
    type: WalletOption.OKX,
    icon: 'https://pioneers.dev/coins/okx.png',
    chains: availableChainsByWallet[WalletOption.OKX],
    wallet: okxWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(okxWallet);
  walletsVerbose.push(walletOKX);
  const walletTrezor = {
    type: WalletOption.TREZOR,
    icon: 'https://pioneers.dev/coins/trezor.png',
    chains: availableChainsByWallet[WalletOption.TREZOR],
    wallet: trezorWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(trezorWallet);
  walletsVerbose.push(walletTrezor);
  const walletWalletConnect = {
    type: WalletOption.WALLETCONNECT,
    icon: 'https://pioneers.dev/coins/walletconnect.png',
    chains: availableChainsByWallet[WalletOption.WALLETCONNECT],
    wallet: walletconnectWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(walletconnectWallet);
  walletsVerbose.push(walletWalletConnect);
  const walletXDefi = {
    type: WalletOption.XDEFI,
    icon: 'https://pioneers.dev/coins/xdefi.png',
    chains: availableChainsByWallet[WalletOption.XDEFI],
    wallet: xdefiWallet,
    status: 'offline',
    isConnected: false,
  };
  wallets.push(xdefiWallet);
  walletsVerbose.push(walletXDefi);

  // TODO test each for detection

  return { wallets, walletsVerbose };
}
