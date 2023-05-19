import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  prepareNetworkSwitch,
} from '@thorswap-lib/toolbox-evm';
import {
  Chain,
  ChainToChainId,
  ChainToHexChainId,
  ConnectWalletParams,
  RPCUrl,
  WalletOption,
} from '@thorswap-lib/types';
import WalletConnect from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';

const SUPPORTED_CHAINS = [Chain.Avalanche, Chain.Ethereum, Chain.BinanceSmartChain] as const;

const getToolbox = async ({
  api,
  chain,
  provider,
  signer,
  ethplorerApiKey,
  covalentApiKey,
}: {
  api?: any;
  provider: Web3Provider;
  signer: Signer;
  rpcUrl?: string;
  chain: (typeof SUPPORTED_CHAINS)[number];
  ethplorerApiKey?: string;
  covalentApiKey?: string;
}) => {
  const from = await signer.getAddress();

  switch (chain) {
    case Chain.Avalanche:
    case Chain.BinanceSmartChain: {
      if (!covalentApiKey) throw new Error('Covalent API key not found');

      const toolbox =
        chain === Chain.Avalanche
          ? AVAXToolbox({ signer, provider, covalentApiKey, api })
          : BSCToolbox({ signer, provider, covalentApiKey, api });

      const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
        chainId: ChainToHexChainId[chain],
        toolbox,
        // @ts-expect-error
        provider,
      });
      return { ...preparedToolbox, getAddress: () => from };
    }
    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');

      const toolbox = ETHToolbox({ signer, provider, ethplorerApiKey, api });

      const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
        chainId: ChainToHexChainId[chain],
        toolbox,
        // @ts-expect-error
        provider,
      });
      return { ...preparedToolbox, getAddress: () => from };
    }
    default:
      throw new Error('Chain is not supported');
  }
};

const connectWalletconnect =
  ({
    addChain,
    apis,
    rpcUrls,
    config: { ethplorerApiKey, walletConnectProjectId },
  }: ConnectWalletParams) =>
  async (chains: (typeof SUPPORTED_CHAINS)[number][]) => {
    const chainsToConnect = chains.filter((chain) => SUPPORTED_CHAINS.includes(chain));

    const providerOptions = {
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: walletConnectProjectId,
        },
      },
      walletconnect: {
        package: WalletConnect,
        options: {
          appName: walletConnectProjectId,
          rpc: {
            [ChainToChainId[Chain.Ethereum]]: RPCUrl.Ethereum,
            [ChainToChainId[Chain.BinanceSmartChain]]: RPCUrl.BinanceSmartChain,
            [ChainToChainId[Chain.Avalanche]]: RPCUrl.Avalanche,
          },
        },
      },
    };

    //@ts-ignore
    const web3Modal = new Web3Modal({ providerOptions });

    const provider = await web3Modal.connect();
    const web3Provider = new Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    const promises = chainsToConnect.map(async (chain) => {
      const getAddress = () => address;

      const toolbox = await getToolbox({
        provider: web3Provider,
        signer,
        chain,
        ethplorerApiKey,
        api: apis[chain as Chain.Ethereum],
        rpcUrl: rpcUrls[chain],
      });

      addChain({
        chain,
        walletMethods: { ...toolbox, getAddress },
        wallet: { address, balance: [], walletType: WalletOption.WALLETCONNECT },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const walletconnectWallet = {
  connectMethodName: 'connectWalletconnect' as const,
  connect: connectWalletconnect,
  isDetected: () => true,
};
