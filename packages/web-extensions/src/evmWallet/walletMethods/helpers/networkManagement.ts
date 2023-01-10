import { ChainId } from '@thorswap-lib/types';

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

const providerRequest = async ({ provider, params, method }: ProviderRequestParams) => {
  if (!provider?.request) throw new Error('Provider not found');

  return provider.request({
    method,
    params: params ? (Array.isArray(params) ? params : [params]) : [],
  });
};

export const addEVMWalletNetwork = (
  provider: typeof window.ethereum,
  networkParams: NetworkParams,
) =>
  providerRequest({
    provider,
    method: 'wallet_addEthereumChain',
    params: [networkParams],
  });

export const switchEVMWalletNetwork = (
  provider: typeof window.ethereum,
  chainId = ChainId.EthereumHex,
) =>
  providerRequest({
    provider,
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });
