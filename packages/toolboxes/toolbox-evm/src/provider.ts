import { JsonRpcProvider } from '@ethersproject/providers';
import type { EVMChain } from '@thorswap-lib/types';
import { ChainToRPC } from '@thorswap-lib/types';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
