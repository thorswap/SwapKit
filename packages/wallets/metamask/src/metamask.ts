import * as metaMask from '@shapeshiftoss/hdwallet-shapeshift-multichain';
import * as core from "@shapeshiftoss/hdwallet-core";
import {
  enableShapeShiftSnap,
  shapeShiftSnapInstalled,
} from '@shapeshiftoss/metamask-snaps-adapter';
import type { ConnectWalletParams, DerivationPathArray } from '@coinmasters/types';
import { Chain, EVMChain, WalletOption } from '@coinmasters/types';
import { MetaMaskSigner } from './chains/evm.ts';
import { cosmosWalletMethods } from './chains/cosmos.js';
import { thorChainWalletMethods } from './chains/thorchain.js';
import { utxoWalletMethods } from './chains/utxo.js';
import {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  getProvider,
  MATICToolbox,
  OPToolbox,
} from '@coinmasters/toolbox-evm';

const SNAP_ID = 'npm:@shapeshiftoss/metamask-snaps';

const getWalletForType = (
  walletType:
    | WalletOption.BRAVE
    | WalletOption.METAMASK
    | WalletOption.TRUSTWALLET_WEB
    | WalletOption.COINBASE_WEB,
) => {
  switch (walletType) {
    case WalletOption.BRAVE:
      return window.ethereum;
    case WalletOption.METAMASK:
      return window.ethereum;
    case WalletOption.COINBASE_WEB:
      return window.coinbaseWalletExtension;
    case WalletOption.TRUSTWALLET_WEB:
      return window.trustwallet;
  }
};


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

const getEVMWalletMethods = async ({
                                     api,
                                     wallet,
                                     chain,
                                     ethplorerApiKey,
                                     covalentApiKey,
                                     rpcUrl,
                                     derivationPath = [2147483692, 2147483708, 2147483648, 0, 0],
                                   }: any) => {
  const provider = getProvider(chain as EVMChain, rpcUrl);
  const signer = new MetaMaskSigner({ wallet, chain, derivationPath, provider });
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
      const walletMethods = await getEVMWalletMethods({
        wallet,
        api,
        chain,
        covalentApiKey,
        derivationPath: [2147483692, 2147483708, 2147483648, 0, 0],
        ethplorerApiKey,
        rpcUrl,
      });

      return { address: walletMethods.getAddress(), walletMethods };
    }
    case Chain.Binance: {
      const walletMethods = await binanceWalletMethods({ wallet });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ wallet, api });
      // @ts-ignore
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
  async (chains: (typeof METAMASK_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {
    //is metamask available?
    const isMetaMaskAvailable = (): boolean => {
      return (window as any).ethereum !== undefined && (window as any).ethereum.isMetaMask;
    };

    //dont procede if not available
    if (isMetaMaskAvailable) {
      const isSnapInstalled = await shapeShiftSnapInstalled(SNAP_ID);
      console.log(isSnapInstalled);
      //is snap installed?
      //if not installed install snap
      if (!isSnapInstalled) {
        //install it
        const result = await enableShapeShiftSnap(SNAP_ID, '1.0.0');
        console.log('result: ', result);
      }

      const keyring = new core.Keyring();
      const metaMaskAdapter = metaMask.MetaMaskAdapter.useKeyring(keyring);
      let walletMetaMask = await metaMaskAdapter.pairDevice();
      if (walletMetaMask) {
        // pair metamask
        await walletMetaMask.initialize();
        console.log('walletMetaMask: ', walletMetaMask);
        // get all accounts

        //@ts-ignore
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        console.log('accounts: ', accounts);

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
  isDetected: () => true,
};
