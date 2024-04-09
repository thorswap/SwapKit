import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Provider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { type CallParams, getBalance } from "../index.ts";

import type { WithSigner } from "./BaseEVMToolbox.ts";
import {
  BaseEVMToolbox,
  createContract,
  isBrowserProvider,
  isStateChangingCall,
} from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.BinanceSmartChainHex,
  chainName: "Smart Chain",
  nativeCurrency: { name: "Binance Coin", symbol: Chain.Binance, decimals: BaseDecimal.BSC },
  rpcUrls: ["https://bsc-dataseed.binance.org"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.BinanceSmartChain]],
});

export const BSCToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const bscApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.BinanceSmartChain });
  const baseToolbox = BaseEVMToolbox({ provider, signer, isEIP1559Compatible: false });

  const call = async <T>(
    provider: Provider,
    {
      callProvider,
      signer,
      contractAddress,
      abi,
      funcName,
      funcParams = [],
      txOverrides,
    }: WithSigner<CallParams>,
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: refactor
  ): Promise<T> => {
    const contractProvider = callProvider || provider;
    if (!contractAddress) throw new Error("contractAddress must be provided");

    const isStateChanging = isStateChangingCall(abi, funcName);

    const feeData = isStateChanging ? { ...(await baseToolbox.estimateGasPrices()).average } : {};

    if (isStateChanging && isBrowserProvider(contractProvider) && signer) {
      const txObject = await baseToolbox.createContractTxObject({
        contractAddress,
        abi,
        funcName,
        funcParams,
        txOverrides: { ...feeData, ...txOverrides },
      });

      return baseToolbox.EIP1193SendTransaction(txObject) as Promise<T>;
    }

    const contract = createContract(contractAddress, abi, contractProvider);

    // only use signer if the contract function is state changing
    if (isStateChanging) {
      if (!signer) throw new Error("Signer is not defined");

      const address = txOverrides?.from || (await signer.getAddress());
      if (!address) throw new Error("No signer address found");

      const result = await contract.connect(signer).getFunction(funcName)(...funcParams, {
        ...feeData,
        ...txOverrides,
        /**
         * nonce must be set due to a possible bug with ethers.js,
         * expecting a synchronous nonce while the JsonRpcProvider delivers Promise
         */
        nonce: txOverrides?.nonce || (await contractProvider.getTransactionCount(address)),
      });

      return typeof result === "string" ? result : result?.hash;
    }

    const result = await contract.getFunction(funcName)(...funcParams);

    return typeof result === "string" ? result : result?.hash;
  };

  return {
    ...baseToolbox,
    call: <T>(params: CallParams) => call<T>(provider, { signer, ...params }),
    getNetworkParams,
    getBalance: (
      address: string,
      potentialScamFilter = true,
      overwriteProvider?: JsonRpcProvider | BrowserProvider,
    ) =>
      getBalance({
        provider: overwriteProvider || provider,
        api: bscApi,
        address,
        chain: Chain.BinanceSmartChain,
        potentialScamFilter,
      }),
  };
};
