import type { EVMChain } from '@swapkit/types';
import { ChainToRPC } from '@swapkit/types';
import { JsonRpcProvider } from 'ethers/providers';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
