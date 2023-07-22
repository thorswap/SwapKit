import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, RPCUrl } from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

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

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (address: string) => getBalance(provider, bscApi, address),
  };
};
