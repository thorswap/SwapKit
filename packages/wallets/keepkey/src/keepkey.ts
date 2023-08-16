import { Chain, ConnectWalletParams, DerivationPathArray } from '@thorswap-lib/types';

export const KEEPKEY_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Litecoin,
] as const;

// type KeepKeyOptions = {
//   ethplorerApiKey?: string;
//   utxoApiKey?: string;
//   covalentApiKey?: string;
//   trezorManifest?: {
//     email: string;
//     appUrl: string;
//   };
// };

// type Params = KeepKeyOptions & {
//   chain: Chain;
//   derivationPath: DerivationPathArray;
//   rpcUrl?: string;
//   api?: any;
// };

const connectKeepKey =
  ({
    apis,
    rpcUrls,
    addChain,
    config: {
      covalentApiKey,
      ethplorerApiKey = 'freekey',
      utxoApiKey,
      trezorManifest = { appUrl: '', email: '' },
    },
  }: ConnectWalletParams) =>
  async (chain: (typeof KEEPKEY_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {
    console.log(chain);
    console.log(derivationPath);
    console.log(apis);
    console.log(rpcUrls);
    console.log(addChain);
    console.log(covalentApiKey);
    console.log(ethplorerApiKey);
    console.log(utxoApiKey);
    console.log(trezorManifest);
    // const trezorStatus = await //@ts-ignore
    // (TrezorConnect as unknown as TrezorConnect.TrezorConnect).getDeviceState();
    // if (!trezorStatus.success) {
    //   //@ts-ignore
    //   (TrezorConnect as unknown as TrezorConnect.TrezorConnect).init({
    //     lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
    //     manifest: trezorManifest,
    //   });
    // }
    //
    // const { address, walletMethods } = await getToolbox({
    //   api: apis[chain as Chain.Ethereum],
    //   rpcUrl: rpcUrls[chain],
    //   chain,
    //   covalentApiKey,
    //   ethplorerApiKey,
    //   utxoApiKey,
    //   derivationPath,
    // });
    //
    // addChain({
    //   chain,
    //   walletMethods,
    //   wallet: { address, balance: [], walletType: WalletOption.TREZOR },
    // });

    return true;
  };

export const keepkeyWallet = {
  connectMethodName: 'connectKeepKey' as const,
  connect: connectKeepKey,
  isDetected: () => true,
};
