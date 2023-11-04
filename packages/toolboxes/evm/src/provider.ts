import type { EVMChain } from '@coinmasters/types';
import { ChainToRPC } from '@coinmasters/types';
import { JsonRpcProvider } from 'ethers';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
