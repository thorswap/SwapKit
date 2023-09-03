import type { Provider } from '@ethersproject/abstract-provider';
import type { Signer } from '@ethersproject/abstract-signer';
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  BaseDecimal,
  Chain,
  ChainId,
  ChainToExplorerUrl,
  FeeOption,
  RPCUrl,
} from '@thorswap-lib/types';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import { getProvider } from '../provider.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (api: CovalentApiType, address: string) => {
  const provider = getProvider(Chain.Arbitrum);
  const tokenBalances = await api.getBalance(address);

  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ARB);

  return [
    {
      asset: getSignatureAssetFor(Chain.Arbitrum),
      amount: evmGasTokenBalanceAmount,
    },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.ArbitrumHex,
  chainName: 'Arbitrum One',
  nativeCurrency: { name: 'Ethereum', symbol: Chain.Ethereum, decimals: BaseDecimal.ETH },
  rpcUrls: [RPCUrl.Arbitrum],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Arbitrum]],
});

const estimateGasPrices = async (provider: Provider) => {
  try {
    const { gasPrice } = await provider.getFeeData();

    if (!gasPrice) throw new Error('No fee data available');

    return {
      [FeeOption.Average]: { gasPrice },
      [FeeOption.Fast]: { gasPrice },
      [FeeOption.Fastest]: { gasPrice },
    };
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as any).msg ?? (error as any).toString()}`,
    );
  }
};

export const ARBToolbox = ({
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
  const arbApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Arbitrum });
  const baseToolbox = BaseEVMToolbox({ provider, signer, isEIP1559Compatible: false });

  return {
    ...baseToolbox,
    getNetworkParams,
    estimateGasPrices: () => estimateGasPrices(provider),
    getBalance: (address: string) => getBalance(arbApi, address),
  };
};
