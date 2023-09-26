import type { Signer } from '@ethersproject/abstract-signer';
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
import type { ConnectWalletParams } from '@thorswap-lib/types';
import { Chain, WalletOption } from '@thorswap-lib/types';

import { binanceWalletMethods } from './chains/binance.js';
import { cosmosWalletMethods } from './chains/cosmos.js';
import { getEVMSigner } from './chains/evm.js';
import { thorChainWalletMethods } from './chains/thorchain.js';
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

// todo...remove this copypasta?
type KeepKeyOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

export type KeepKeyParams = KeepKeyOptions & {
  sdk: KeepKeySdk;
  chain: Chain;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async (params: KeepKeyParams) => {
  const { sdk, api, rpcUrl, chain, ethplorerApiKey, covalentApiKey, derivationPath, utxoApiKey } =
    params;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      const provider = getProvider(chain, rpcUrl || '');
      const signer = (await getEVMSigner({ sdk, chain, derivationPath, provider })) as Signer;
      const address = await signer.getAddress();
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
      const walletMethods = await binanceWalletMethods({ sdk });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ sdk, api });
      // @ts-ignore
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.THORChain: {
      const walletMethods = await thorChainWalletMethods({ sdk, stagenet: false });
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
      const walletMethods = await utxoWalletMethods(params);
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    default:
      throw new Error('Chain not supported');
  }
};

export const checkKeepkeyAvailability = async (spec: string) => {
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
  async (chains) => {
    const spec = 'http://localhost:1646/spec/swagger.json';

    // test spec: if offline, launch keepkey-bridge
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

    await checkAndLaunch();

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
    const keepKeySdk = await KeepKeySdk.create(config);
    if (config.apiKey !== apiKey) localStorage.setItem('apiKey', config.apiKey);

    for (const chain of chains) {
      const { address, walletMethods } = await getToolbox({
        sdk: keepKeySdk,
        api: apis[chain],
        rpcUrl: rpcUrls[chain],
        chain,
        covalentApiKey,
        ethplorerApiKey,
        utxoApiKey,
      });

      addChain({
        chain,
        walletMethods,
        wallet: { address, balance: [], walletType: WalletOption.KEEPKEY },
      });
    }

    return true;
  };

export const keepkeyWallet = {
  connectMethodName: 'connectKeepKey' as const,
  connect: connectKeepKey,
  isDetected: () => true,
};
