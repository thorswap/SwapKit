import { Signer } from '@ethersproject/abstract-signer';
import { KeepKeySdk } from '@keepkey/keepkey-sdk';
import {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  getProvider,
  MATICToolbox,
  OPToolbox,
} from '@thorswap-lib/toolbox-evm';
import { Chain, ConnectWalletParams, DerivationPathArray, WalletOption } from '@thorswap-lib/types';

import { binanceWalletMethods } from './chains/binance.js';
import { cosmosWalletMethods } from './chains/cosmos.js';
import { getEVMSigner } from './chains/evm.js';
import { thorchainWalletMethods } from './chains/thorchain.js';
import { utxoWalletMethods } from './chains/utxo.js';

export const KEEPKEY_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
] as const;

type KeepKeyOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
  trezorManifest?: {
    email: string;
    appUrl: string;
  };
};

type Params = KeepKeyOptions & {
  sdk: any;
  chain: Chain;
  derivationPath: DerivationPathArray;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async (params: Params) => {
  const { sdk, api, rpcUrl, chain, ethplorerApiKey, covalentApiKey, derivationPath, utxoApiKey } =
    params;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      console.log('chain: ', chain);
      const provider = getProvider(chain, rpcUrl || '');
      console.log('provider: ', provider);
      const signer = (await getEVMSigner({ sdk, chain, derivationPath, provider })) as Signer;
      const address = await signer.getAddress();
      console.log('address: ', address);
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');

      const evmParams = { api, signer, provider };
      const walletMethods = (() => {
        if (chain === Chain.Ethereum) {
          return ETHToolbox({ ...evmParams, ethplorerApiKey: ethplorerApiKey as string });
        } else if (chain === Chain.Avalanche) {
          return AVAXToolbox({ ...evmParams, covalentApiKey: covalentApiKey as string });
        } else if (chain === Chain.BinanceSmartChain) {
          return BSCToolbox({ ...evmParams, covalentApiKey: covalentApiKey as string });
        } else if (chain === Chain.Arbitrum) {
          return ARBToolbox({ ...evmParams, covalentApiKey: covalentApiKey as string });
        } else if (chain === Chain.Optimism) {
          return OPToolbox({ ...evmParams, covalentApiKey: covalentApiKey as string });
        } else if (chain === Chain.Polygon) {
          return MATICToolbox({ ...evmParams, covalentApiKey: covalentApiKey as string });
        } else {
          throw new Error('Chain not supported chain: ' + chain);
        }
      })();

      return { address, walletMethods: { ...walletMethods, getAddress: () => address } };
    }
    case Chain.Binance: {
      const walletMethods = await binanceWalletMethods({ sdk, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ sdk, api, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.THORChain: {
      const walletMethods = await thorchainWalletMethods({ sdk, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      let params = {
        api,
        sdk,
        chain,
        stagenet: false,
        utxoApiKey,
        derivationPath,
      };
      console.log('params: ', params);
      const walletMethods = await utxoWalletMethods(params);
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    default:
      throw new Error('Chain not supported');
  }
};

export const checkKeepkeyAvailability = async (spec:string) => {
  try {
    const response = await fetch(spec);
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
  return false;
};

const connectKeepKey =
  ({
    apis,
    rpcUrls,
    addChain,
    config: { covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: ConnectWalletParams) =>
  async (chain: (typeof KEEPKEY_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {
    const spec = 'http://localhost:1646/spec/swagger.json';

    //test spec: if offline, launch keepkey-bridge
    let attempt = 0;
    const checkAndLaunch = async () => {
      attempt++;
      if (!(await checkKeepkeyAvailability(spec))) {
        if (attempt === 3) {
          alert(
            'KeepKey desktop is required for keepkey-sdk, please go to https://keepkey.com/get-started',
          );
        } else {
          window.location.assign('keepkey://launch');
          await new Promise((resolve) => setTimeout(resolve, 30000));
          checkAndLaunch();
        }
      }
    };

    checkAndLaunch();

    const apiKey = localStorage.getItem('apiKey') || '1234';
    const config: any = {
      apiKey,
      pairingInfo: {
        name: 'swapKit-demo-app',
        imageUrl: 'https://thorswap.finance/assets/img/header_logo.png',
        basePath: spec,
        url: 'http://localhost:1646',
      },
    };
    // init
    const sdk = await KeepKeySdk.create(config);
    if (config.apiKey !== apiKey) localStorage.setItem('apiKey', config.apiKey);

    const { address, walletMethods } = await getToolbox({
      sdk,
      api: apis[chain],
      rpcUrl: rpcUrls[chain],
      chain,
      covalentApiKey,
      ethplorerApiKey,
      utxoApiKey,
      derivationPath,
    });

    addChain({
      chain,
      walletMethods,
      wallet: { address, balance: [], walletType: WalletOption.KEEPKEY },
    });

    return true;
  };

export const keepkeyWallet = {
  connectMethodName: 'connectKeepKey' as const,
  connect: connectKeepKey,
  isDetected: () => true,
};
