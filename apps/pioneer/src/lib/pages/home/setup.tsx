// Import necessary dependencies
import { WalletOption, availableChainsByWallet } from "@coinmasters/types";

// setup
const pioneerSetup: any = {
  appName: "Pioneer Template",
  appIcon: "https://pioneers.dev/coins/pioneerMan.png",
};

// Define the initWallets function
export const initWallets = async (onStart: any) => {
  try {
    const walletsVerbose: any = [];
    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { keplrWallet } = await import("@coinmasters/wallet-keplr");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { keystoreWallet } = await import("@coinmasters/wallet-keystore");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { metamaskWallet } = await import("@coinmasters/wallet-metamask");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { ledgerWallet } = await import("@coinmasters/wallet-ledger");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { okxWallet } = await import("@coinmasters/wallet-okx");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { trezorWallet } = await import("@coinmasters/wallet-trezor");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { walletconnectWallet } = await import("@coinmasters/wallet-wc");

    // @ts-ignore
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { xdefiWallet } = await import("@coinmasters/wallet-xdefi");

    // Initialize and push each wallet into the wallets array
    const walletKeepKey = {
      type: WalletOption.KEEPKEY,
      icon: "https://pioneers.dev/coins/keepkey.png",
      chains: availableChainsByWallet[WalletOption.KEEPKEY],
      wallet: keepkeyWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletKeepKey);
    const walletMetaMask = {
      type: WalletOption.METAMASK,
      icon: "https://pioneers.dev/coins/metamask.png",
      chains: availableChainsByWallet[WalletOption.METAMASK],
      wallet: metamaskWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletMetaMask);
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
      icon: "https://pioneers.dev/coins/keplr.png",
      chains: availableChainsByWallet[WalletOption.KEPLR],
      wallet: keplrWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletKeplr);
    const walletKeystore = {
      type: WalletOption.KEYSTORE,
      icon: "https://pioneers.dev/coins/keystore.png",
      chains: availableChainsByWallet[WalletOption.KEYSTORE],
      wallet: keystoreWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletKeystore);
    const walletLedger = {
      type: WalletOption.LEDGER,
      icon: "https://pioneers.dev/coins/ledger.png",
      chains: availableChainsByWallet[WalletOption.LEDGER],
      wallet: ledgerWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletLedger);
    const walletOKX = {
      type: WalletOption.OKX,
      icon: "https://pioneers.dev/coins/okx.png",
      chains: availableChainsByWallet[WalletOption.OKX],
      wallet: okxWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletOKX);
    const walletTrezor = {
      type: WalletOption.TREZOR,
      icon: "https://pioneers.dev/coins/trezor.png",
      chains: availableChainsByWallet[WalletOption.TREZOR],
      wallet: trezorWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletTrezor);
    const walletWalletConnect = {
      type: WalletOption.WALLETCONNECT,
      icon: "https://pioneers.dev/coins/walletconnect.png",
      chains: availableChainsByWallet[WalletOption.WALLETCONNECT],
      wallet: walletconnectWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletWalletConnect);
    const walletXDefi = {
      type: WalletOption.XDEFI,
      icon: "https://pioneers.dev/coins/xdefi.png",
      chains: availableChainsByWallet[WalletOption.XDEFI],
      wallet: xdefiWallet,
      status: "offline",
      isConnected: false,
    };
    walletsVerbose.push(walletXDefi);

    // appIcon info
    console.log('walletsVerbose: ', walletsVerbose);
    onStart(walletsVerbose, pioneerSetup);
  } catch (e) {
    console.error(e);
  }
};
