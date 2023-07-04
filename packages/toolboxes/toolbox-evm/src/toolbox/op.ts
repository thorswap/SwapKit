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
  const provider = getProvider(Chain.Optimism);
  const tokenBalances = await api.getBalance(address);

  if (assets) {
    return tokenBalances.filter(({ asset }) =>
      assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
    );
  }

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
  nativeCurrency: {
    name: 'Optimism',
    symbol: Chain.Optimism,
    decimals: 18,
  },
  rpcUrls: [RPCUrl.Optimism],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Optimism]],
});

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

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) => getBalance(opApi, address, assets),
  };
};
