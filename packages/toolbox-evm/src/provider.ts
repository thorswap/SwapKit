import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, EVMChain, RPCUrl } from '@thorswap-lib/types';

export const getProvider = (chain: EVMChain) => {
  switch (chain) {
    case Chain.Avalanche:
      return new JsonRpcProvider(RPCUrl.Avalanche);
    case Chain.BinanceSmartChain:
      return new JsonRpcProvider(RPCUrl.BinanceSmartChain);
    case Chain.Ethereum:
      return new JsonRpcProvider(RPCUrl.Ethereum);
  }
};
