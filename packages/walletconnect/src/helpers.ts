import { Chain, ChainId, ChainToChainId } from '@thorswap-lib/types';

export const getAddressFromAccount = (account: string) => {
  try {
    return account.split(':')[2];
  } catch (error) {
    throw new Error('Invalid WalletConnect account');
  }
};

export const getAddressByChain = (
  chain: Chain.Binance | Chain.THORChain | Chain.Ethereum,
  accounts: string[],
): string =>
  getAddressFromAccount(
    accounts.find((account) => account.startsWith(ChainToChainId[chain])) || '',
  );

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

export const addEVMWalletNetwork = (
  provider: typeof window.ethereum,
  networkParams: NetworkParams,
) => providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (
  provider: typeof window.ethereum,
  chainId = ChainId.EthereumHex,
) => providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });
