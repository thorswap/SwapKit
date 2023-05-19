import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainToRPC, EVMChain } from '@thorswap-lib/types';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
