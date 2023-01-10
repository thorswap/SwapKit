import { ChainId } from '@thorswap-lib/types';

import { switchEVMWalletNetwork } from './networkManagement.js';

export const prepareNetworkSwitch = <T extends { [key: string]: (...args: any[]) => any }>({
  toolbox,
  chainId,
  provider = window.ethereum,
}: {
  toolbox: T;
  chainId: ChainId;
  provider?: typeof window.ethereum;
}) => {
  const methodsToWrap = [
    'approve',
    'call',
    'sendTransaction',
    'transfer',
    'getBalance',
    'isApproved',
  ];
  const wrappedMethods = methodsToWrap.reduce((object, methodName) => {
    if (!toolbox[methodName]) return object;
    const method = toolbox[methodName];
    return {
      ...object,
      [methodName]: wrapMethodWithNetworkSwitch<typeof method>(method, provider, chainId),
    };
  }, {});

  const preparedToolbox = {
    ...toolbox,
    ...wrappedMethods,
  };
  return preparedToolbox;
};

export const wrapMethodWithNetworkSwitch = <T extends (...args: any[]) => any>(
  func: T,
  provider: typeof window.ethereum,
  chainId: ChainId,
) => {
  return ((...args: any[]) => {
    switchEVMWalletNetwork(provider, chainId);
    return func(...args);
  }) as unknown as T;
};
