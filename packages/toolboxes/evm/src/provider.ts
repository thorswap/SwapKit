import { ChainToRPC, type EVMChain } from "@swapkit/helpers";
import { JsonRpcProvider } from "ethers/providers";

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};
