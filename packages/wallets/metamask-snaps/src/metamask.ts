import * as core from '@shapeshiftoss/hdwallet-core';
import * as metaMask from '@shapeshiftoss/hdwallet-shapeshift-multichain';
import {
  enableShapeShiftSnap,
  shapeShiftSnapInstalled,
} from '@shapeshiftoss/metamask-snaps-adapter';
import {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  getProvider,
  MATICToolbox,
  OPToolbox,
} from '@swapkit/toolbox-evm';
import type { ConnectWalletParams, DerivationPathArray } from '@swapkit/types';
import { Chain, WalletOption } from '@swapkit/types';

import { cosmosWalletMethods } from './chains/cosmos.js';
import { getEVMSigner } from './chains/evm.js';
import { thorChainWalletMethods } from './chains/thorchain.js';
import { utxoWalletMethods } from './chains/utxo.js';

const SNAP_ID = 'npm:@shapeshiftoss/metamask-snaps';

export const METAMASK_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
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
type MetaMaskOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

export type MetaMaskParams = MetaMaskOptions & {
  wallet: any;
  chain: Chain;
  derivationPath: DerivationPathArray;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async (params: MetaMaskParams) => {
  const {
    wallet,
    api,
    rpcUrl,
    chain,
    ethplorerApiKey,
    covalentApiKey,
    derivationPath,
    utxoApiKey,
  } = params;

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

      const provider = getProvider(chain, rpcUrl || '');
      const signer = await getEVMSigner({ wallet, chain, derivationPath, provider });
      const address = await signer.getAddress();

      const evmParams = {
        api,
        signer,
        provider,
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey: covalentApiKey as string,
      };

      const walletMethods = (() => {
        if (chain === Chain.Ethereum) {
          return ETHToolbox(evmParams);
        } else if (chain === Chain.Avalanche) {
          return AVAXToolbox(evmParams);
        } else if (chain === Chain.BinanceSmartChain) {
          return BSCToolbox(evmParams);
        } else if (chain === Chain.Arbitrum) {
          return ARBToolbox(evmParams);
        } else if (chain === Chain.Optimism) {
          return OPToolbox(evmParams);
        } else if (chain === Chain.Polygon) {
          return MATICToolbox(evmParams);
        } else {
          throw new Error('Chain not supported chain: ' + chain);
        }
      })();

      return { address, walletMethods: { ...walletMethods, getAddress: () => address } };
    }

    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ wallet, api });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.THORChain: {
      const walletMethods = await thorChainWalletMethods({ wallet, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      let params = {
        api,
        wallet,
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

const connectMetaMask =
  ({
    apis,
    rpcUrls,
    addChain,
    config: { covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: ConnectWalletParams) =>
  async (chains: Chain[], derivationPath: DerivationPathArray) => {
    if ((window as any).ethereum !== undefined && (window as any).ethereum.isMetaMask) {
      const isSnapInstalled = await shapeShiftSnapInstalled(SNAP_ID);
      console.log(isSnapInstalled);

      if (!isSnapInstalled) {
        //install it
        await enableShapeShiftSnap(SNAP_ID, '1.0.0');
      }
      const keyring = new core.Keyring();
      const metaMaskAdapter = metaMask.MetaMaskAdapter.useKeyring(keyring);
      const walletMetaMask = await metaMaskAdapter.pairDevice();

      if (walletMetaMask) {
        // pair metamask
        await walletMetaMask.initialize();

        // For what if they are only logged?

        // get all accounts
        // const accounts =  await window.ethereum.request({ method: 'eth_requestAccounts' });
        // console.log(accounts)

        for (const chain of chains) {
          const { address, walletMethods } = await getToolbox({
            wallet: walletMetaMask,
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
            wallet: { address, balance: [], walletType: WalletOption.METAMASK },
          });
        }
      }
    }
    return true;
  };

export const metamaskWallet = {
  connectMethodName: 'connectMetaMask' as const,
  connect: connectMetaMask,
  isDetected: () => (window as any).ethereum !== undefined && (window as any).ethereum.isMetaMask,
};
