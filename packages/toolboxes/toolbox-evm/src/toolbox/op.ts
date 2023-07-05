import {
  estimateL1GasCost,
  estimateL2GasCost,
  estimateTotalGasCost,
  getL1GasPrice,
} from '@eth-optimism/sdk';
import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  BaseDecimal,
  Chain,
  ChainId,
  ChainToExplorerUrl,
  FeeOption,
  RPCUrl,
} from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (api: CovalentApiType, address: Address) => {
  const provider = getProvider(Chain.Optimism);
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.OP);

  return [
    { asset: getSignatureAssetFor(Chain.Optimism), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.OptimismHex,
  chainName: 'Optimism',
  nativeCurrency: { name: 'Ethereum', symbol: Chain.Ethereum, decimals: BaseDecimal.ETH },
  rpcUrls: [RPCUrl.Optimism],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Optimism]],
});

const estimateGasPrices = async (provider: Provider) => {
  try {
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider.getFeeData();
    const l1GasPrice = await getL1GasPrice(provider);

    if (!maxFeePerGas || !maxPriorityFeePerGas) throw new Error('No fee data available');

    return {
      [FeeOption.Average]: {
        l1GasPrice,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
      },
      [FeeOption.Fast]: {
        l1GasPrice: l1GasPrice.mul(15).div(10),
        gasPrice: gasPrice?.mul(15).div(10),
        maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas.mul(15).div(10),
      },
      [FeeOption.Fastest]: {
        l1GasPrice: l1GasPrice.mul(2),
        gasPrice: gasPrice?.mul(2),
        maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas.mul(2),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as any).msg ?? (error as any).toString()}`,
    );
  }
};

export const OPToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const opApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Optimism });
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    estimateTotalGasCost,
    estimateL1GasCost,
    estimateL2GasCost,
    getL1GasPrice,
    getNetworkParams,
    estimateGasPrices: () => estimateGasPrices(provider),
    getBalance: (address: string) => getBalance(opApi, address),
  };
};
