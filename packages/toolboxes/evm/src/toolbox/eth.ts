import { Chain, type FeeOption } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Signer } from "ethers";

import type { EthplorerApiType } from "../api/ethplorerApi.ts";
import { ethplorerApi } from "../api/ethplorerApi.ts";
import { type EVMTxBaseParams, estimateTransactionFee, getBalance } from "../index.ts";

import { EVMToolbox } from "./EVMToolbox.ts";

export const ETHToolbox = ({
  api,
  ethplorerApiKey,
  signer,
  provider,
}: {
  api?: EthplorerApiType;
  ethplorerApiKey?: string;
  signer?: Signer | JsonRpcSigner;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const ethApi = api || ethplorerApi(ethplorerApiKey);
  const evmToolbox = EVMToolbox({ provider, signer });
  const chain = Chain.Ethereum;

  return {
    ...evmToolbox,
    estimateTransactionFee: (txObject: EVMTxBaseParams, feeOptionKey?: FeeOption) =>
      estimateTransactionFee(txObject, feeOptionKey, chain, provider),
    getBalance: (
      address: string,
      potentialScamFilter = true,
      overwriteProvider?: JsonRpcProvider | BrowserProvider,
    ) =>
      getBalance({
        provider: overwriteProvider || provider,
        api: ethApi,
        address,
        chain,
        potentialScamFilter,
      }),
  };
};
