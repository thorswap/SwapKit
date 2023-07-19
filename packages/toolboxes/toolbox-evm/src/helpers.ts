import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Chain, ChainId, ChainToHexChainId } from '@thorswap-lib/types';

import { AVAXToolbox, BSCToolbox, EthereumWindowProvider, ETHToolbox } from './index.js';

type NetworkParams = {
  chainId: ChainId;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

type ProviderRequestParams = {
  provider?: ExternalProvider;
  params?: any;
  method:
    | 'wallet_addEthereumChain'
    | 'wallet_switchEthereumChain'
    | 'eth_requestAccounts'
    | 'eth_sendTransaction'
    | 'eth_signTransaction';
};

const methodsToWrap = [
  'approve',
  'call',
  'sendTransaction',
  'transfer',
  'getBalance',
  'isApproved',
];

export const prepareNetworkSwitch = <T extends { [key: string]: (...args: any[]) => any }>({
  toolbox,
  chainId,
  provider = window.ethereum,
}: {
  toolbox: T;
  chainId: ChainId;
  provider?: ExternalProvider;
}) => {
  const wrappedMethods = methodsToWrap.reduce((object, methodName) => {
    if (!toolbox[methodName]) return object;
    const method = toolbox[methodName];

    return {
      ...object,
      [methodName]: wrapMethodWithNetworkSwitch<typeof method>(method, provider, chainId),
    };
  }, {});

  return { ...toolbox, ...wrappedMethods };
};

export const wrapMethodWithNetworkSwitch = <T extends (...args: any[]) => any>(
  func: T,
  provider: ExternalProvider,
  chainId: ChainId,
) =>
  (async (...args: any[]) => {
    await switchEVMWalletNetwork(provider, chainId).catch(
      (error) => new Error(`Failed to switch network: ${error.message}`),
    );
    return func(...args);
  }) as unknown as T;

const providerRequest = async ({ provider, params, method }: ProviderRequestParams) => {
  if (!provider?.request) throw new Error('Provider not found');

  const providerParams = params ? (Array.isArray(params) ? params : [params]) : [];
  return provider.request({ method, params: providerParams });
};

export const addEVMWalletNetwork = (provider: ExternalProvider, networkParams: NetworkParams) =>
  providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (provider: ExternalProvider, chainId = ChainId.EthereumHex) =>
  providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });

export const getWeb3WalletMethods = ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  ethereumWindowProvider: EthereumWindowProvider | undefined;
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}) => {
  if (!ethereumWindowProvider) throw new Error('Requested web3 wallet is not installed');

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  const provider = new Web3Provider(ethereumWindowProvider, 'any');

  const toolboxParams = {
    provider,
    signer: provider.getSigner(),
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const toolbox =
    chain === Chain.Ethereum
      ? ETHToolbox(toolboxParams)
      : chain === Chain.Avalanche
      ? AVAXToolbox(toolboxParams)
      : BSCToolbox(toolboxParams);

  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider: ethereumWindowProvider,
  });
};
