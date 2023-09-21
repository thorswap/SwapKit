import type { Provider } from '@ethersproject/abstract-provider';
import type { Signer } from '@ethersproject/abstract-signer';
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from '@thorswap-lib/types';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import type { CallParams } from '../index.ts';

import type { WithSigner } from './BaseEVMToolbox.ts';
import {
  BaseEVMToolbox,
  createContract,
  isStateChangingCall,
  isWeb3Provider,
} from './BaseEVMToolbox.ts';

export const getBalance = async (provider: Provider, api: CovalentApiType, address: string) => {
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    {
      asset: getSignatureAssetFor(Chain.BinanceSmartChain),
      amount: baseAmount(evmGasTokenBalance, BaseDecimal.BSC),
    },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.BinanceSmartChainHex,
  chainName: 'Smart Chain',
  nativeCurrency: { name: 'Binance Coin', symbol: Chain.Binance, decimals: BaseDecimal.BSC },
  rpcUrls: ['https://bsc-dataseed.binance.org'],
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
  provider: JsonRpcProvider | Web3Provider;
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
  ): Promise<T> => {
    const contractProvider = callProvider || provider;
    if (!contractAddress) throw new Error('contractAddress must be provided');

    const isStateChanging = isStateChangingCall(abi, funcName);

    const feeData = isStateChanging ? { ...(await baseToolbox.estimateGasPrices()).average } : {};

    if (isStateChanging && isWeb3Provider(contractProvider) && signer) {
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
      if (!signer) throw new Error('Signer is not defined');

      const address = txOverrides?.from || (await signer.getAddress());

      if (!address) throw new Error('No signer address found');

      const result = await contract.connect(signer)[funcName](...funcParams, {
        ...feeData,
        ...txOverrides,
        /**
         * nonce must be set due to a possible bug with ethers.js,
         * expecting a synchronous nonce while the JsonRpcProvider delivers Promise
         */
        nonce: txOverrides?.nonce || (await contractProvider.getTransactionCount(address)),
      });

      return typeof result?.hash === 'string' ? result?.hash : result;
    }

    const result = await contract[funcName](...funcParams);

    return typeof result?.hash === 'string' ? result?.hash : result;
  };

  return {
    ...baseToolbox,
    call: (params: CallParams) => call(provider, { signer, ...params }),
    getNetworkParams,
    getBalance: (address: string) => getBalance(provider, bscApi, address),
  };
};
