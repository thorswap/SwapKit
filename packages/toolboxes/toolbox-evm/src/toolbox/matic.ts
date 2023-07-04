import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  BaseDecimal,
  Chain,
  ChainId,
  ChainToExplorerUrl,
  RPCUrl,
} from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (
  api: CovalentApiType,
  address: Address,
  assets?: AssetEntity[],
) => {
  const provider = getProvider(Chain.Polygon);
  const tokenBalances = await api.getBalance(address);

  if (assets) {
    return tokenBalances.filter(({ asset }) =>
      assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
    );
  }

  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.MATIC);
  return [
    { asset: getSignatureAssetFor(Chain.Polygon), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.PolygonHex,
  chainName: 'Polygon',
  nativeCurrency: {
    name: 'Polygon',
    symbol: Chain.Polygon,
    decimals: 18,
  },
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
  provider: Provider | Web3Provider;
}) => {
  const maticApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Polygon });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) => getBalance(maticApi, address, assets),
  };
};
