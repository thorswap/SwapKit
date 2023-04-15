import { ChainId, WalletOption } from '@thorswap-lib/types';

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
  provider?: typeof window.ethereum;
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

export const getWalletForType = (
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

export const prepareNetworkSwitch = <T extends { [key: string]: (...args: any[]) => any }>({
  toolbox,
  chainId,
  provider = window.ethereum,
}: {
  toolbox: T;
  chainId: ChainId;
  provider?: typeof window.ethereum;
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
  provider: typeof window.ethereum,
  chainId: ChainId,
) =>
  ((...args: any[]) => {
    switchEVMWalletNetwork(provider, chainId);
    return func(...args);
  }) as unknown as T;

const providerRequest = async ({ provider, params, method }: ProviderRequestParams) => {
  if (!provider?.request) throw new Error('Provider not found');

  const providerParams = params ? (Array.isArray(params) ? params : [params]) : [];
  return provider.request({ method, params: providerParams });
};

export const addEVMWalletNetwork = (
  provider: typeof window.ethereum,
  networkParams: NetworkParams,
) => providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (
  provider: typeof window.ethereum,
  chainId = ChainId.EthereumHex,
) => providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });
