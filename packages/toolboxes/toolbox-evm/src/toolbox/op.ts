import { Provider, TransactionRequest } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { serialize } from '@ethersproject/transactions';
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
import { gasOracleAbi } from '../contracts/op/gasOracle.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

const GAS_PRICE_ORACLE_ADDRESS = '0x420000000000000000000000000000000000000f';

export const connectGasPriceOracle = (provider: Provider) => {
  return new Contract(GAS_PRICE_ORACLE_ADDRESS, gasOracleAbi, provider);
};

export const getL1GasPrice = async (provider: Provider) => {
  return connectGasPriceOracle(provider).l1BaseFee();
};

const _serializeTx = async (
  provider: Provider,
  { data, from, to, gasPrice, type, gasLimit, nonce }: TransactionRequest,
) => {
  return serialize({
    data,
    to,
    gasPrice,
    type,
    gasLimit,
    nonce: nonce
      ? BigNumber.from(nonce).toNumber()
      : from
      ? await provider.getTransactionCount(from)
      : 0,
  });
};

export const estimateL1GasCost = async (provider: Provider, tx: TransactionRequest) => {
  return connectGasPriceOracle(provider).getL1Fee(await _serializeTx(provider, tx));
};

export const estimateL2GasCost = async (
  provider: Provider,
  tx: TransactionRequest,
): Promise<BigNumber> => {
  const l2GasPrice = await provider.getGasPrice();
  const l2GasCost = await provider.estimateGas(tx);
  return l2GasPrice.mul(l2GasCost);
};

export const estimateTotalGasCost = async (provider: Provider, tx: TransactionRequest) => {
  const l1GasCost = await estimateL1GasCost(provider, tx);
  const l2GasCost = await estimateL2GasCost(provider, tx);
  return l1GasCost.add(l2GasCost);
};

export const estimateL1Gas = async (provider: Provider, tx: TransactionRequest) => {
  return connectGasPriceOracle(provider).getL1GasUsed(await _serializeTx(provider, tx));
};

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
    estimateTotalGasCost: (tx: TransactionRequest) => estimateTotalGasCost(provider, tx),
    estimateL1GasCost: (tx: TransactionRequest) => estimateL1GasCost(provider, tx),
    estimateL2GasCost: (tx: TransactionRequest) => estimateL2GasCost(provider, tx),
    getL1GasPrice: () => getL1GasPrice(provider),
    estimateL1Gas: (tx: TransactionRequest) => estimateL1Gas(provider, tx),
    getNetworkParams,
    estimateGasPrices: () => estimateGasPrices(provider),
    getBalance: (address: string) => getBalance(opApi, address),
  };
};
