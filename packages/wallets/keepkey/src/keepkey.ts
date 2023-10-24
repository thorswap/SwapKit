import { KeepKeySdk } from '@keepkey/keepkey-sdk';
import {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  getProvider,
  MATICToolbox,
  OPToolbox,
} from '@swapkit/toolbox-evm';
import type { ConnectWalletParams, DerivationPathArray, EVMChain } from '@swapkit/types';
import { Chain, WalletOption } from '@swapkit/types';

import { binanceWalletMethods } from './chains/binance.js';
import { cosmosWalletMethods } from './chains/cosmos.js';
import { KeepKeySigner } from './chains/evm.ts';
import { thorchainWalletMethods } from './chains/thorchain.ts';
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
  keepkeyApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

const getKeepKeySdk = async (apiKey: string) =>
  KeepKeySdk.create({
    apiKey,
    pairingInfo: {
      // TODO: @highlander - check what should be passed there
      url: '',
      name: 'SwapKit - KeepKey',
      imageUrl: 'https://thorswap.finance/assets/img/header_logo.png',
    },
  });

const getEVMWalletMethods = async ({
  api,
  apiKey,
  chain,
  ethplorerApiKey = '',
  covalentApiKey = '',
  rpcUrl = '',
  derivationPath = [2147483692, 2147483708, 2147483648, 0, 0],
}: {
  derivationPath: DerivationPathArray;
  ethplorerApiKey: string;
  covalentApiKey: string;
  apiKey: string;
  chain: EVMChain;
  rpcUrl: string;
  api?: any;
}) => {
  const sdk = await getKeepKeySdk(apiKey);
  const provider = getProvider(chain as EVMChain, rpcUrl);
  const signer = new KeepKeySigner({ sdk, chain, derivationPath, provider });
  const address = await signer.getAddress();
  const evmParams = { api, signer, provider };

  switch (chain) {
    case Chain.Ethereum:
      return { ...ETHToolbox({ ...evmParams, ethplorerApiKey }), getAddress: () => address };
    case Chain.BinanceSmartChain:
      return { ...BSCToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Arbitrum:
      return { ...ARBToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Optimism:
      return { ...OPToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Polygon:
      return { ...MATICToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Avalanche:
      return { ...AVAXToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };

    default:
      throw new Error('Chain not supported');
  }
};

const getToolbox = async ({
  api,
  keepkeyApiKey = '',
  rpcUrl = '',
  chain,
  ethplorerApiKey = '',
  covalentApiKey = '',
  utxoApiKey = '',
}: KeepKeyOptions & { chain: Chain; rpcUrl?: string; api?: any }) => {
  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');
      const walletMethods = await getEVMWalletMethods({
        api,
        apiKey: keepkeyApiKey,
        chain,
        covalentApiKey,
        derivationPath: [2147483692, 2147483708, 2147483648, 0, 0],
        ethplorerApiKey,
        rpcUrl,
      });

      return { address: walletMethods.getAddress(), walletMethods };
    }

    case Chain.Binance:
    case Chain.Cosmos:
    case Chain.THORChain: {
      const sdk = await getKeepKeySdk(keepkeyApiKey);
      const walletMethods =
        chain === Chain.Binance
          ? await binanceWalletMethods({ sdk })
          : chain === Chain.Cosmos
          ? await cosmosWalletMethods({ sdk, api })
          : await thorchainWalletMethods({ sdk });

      return { address: await walletMethods.getAddress(), walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const sdk = await getKeepKeySdk(keepkeyApiKey);
      const walletMethods = await utxoWalletMethods({ api, sdk, chain, utxoApiKey });
      return { address: await walletMethods.getAddress(), walletMethods };
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

// TODO: write down more info around this part of connection with docs url
// test spec: if offline, launch keepkey-bridge
let attempt = 0;
const checkAndLaunch = async () => {
  attempt++;
  if (!(await checkKeepkeyAvailability('http://localhost:1646/spec/swagger.json'))) {
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

const connectKeepKey =
  ({
    apis,
    rpcUrls,
    addChain,
    config: { keepkeyApiKey = '1234', covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: ConnectWalletParams) =>
  async (chains: typeof KEEPKEY_SUPPORTED_CHAINS) => {
    await checkAndLaunch();

    for (const chain of chains) {
      const { address, walletMethods } = await getToolbox({
        keepkeyApiKey,
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
  // TODO - @Highlander - check if keepkey is connected
  isDetected: () => checkKeepkeyAvailability('http://localhost:1646/spec/swagger.json'),
};
