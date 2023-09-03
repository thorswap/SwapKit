import type { Signer } from '@ethersproject/abstract-signer';
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, RPCUrl } from '@thorswap-lib/types';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import { getProvider } from '../provider.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (api: CovalentApiType, address: string) => {
  const provider = getProvider(Chain.Polygon);
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.MATIC);

  return [
    { asset: getSignatureAssetFor(Chain.Polygon), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.PolygonHex,
  chainName: 'Polygon Mainnet',
  nativeCurrency: { name: 'Polygon', symbol: Chain.Polygon, decimals: BaseDecimal.MATIC },
  rpcUrls: [RPCUrl.Polygon],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Polygon]],
});

export const MATICToolbox = ({
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
  const maticApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Polygon });
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (address: string) => getBalance(maticApi, address),
  };
};
