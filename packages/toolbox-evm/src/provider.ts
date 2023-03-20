import { JsonRpcProvider } from '@ethersproject/providers';
import { EVMChain, RPCUrlForChain } from '@thorswap-lib/types';

export const getProvider = (chain: EVMChain) => {
  return new JsonRpcProvider(RPCUrlForChain[chain]);
};
