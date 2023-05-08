import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, TxHistoryParams } from '@thorswap-lib/types';

import { EthereumApi } from '../api/eth/EthereumHybridApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (
  provider: Provider,
  api: EthereumApi,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance({ address });

  if (assets) {
    return tokenBalances.filter(({ asset }) =>
      assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
    );
  } else {
    const evmGasTokenBalance = await provider.getBalance(address);
    return [
      {
        asset: getSignatureAssetFor(Chain.Ethereum),
        amount: baseAmount(evmGasTokenBalance, BaseDecimal.ETH),
      },
      ...tokenBalances,
    ];
  }
};

export const getTransactions = async (api: EthereumApi, params?: TxHistoryParams) => {
  if (!params?.address) throw new Error('address is required');
  return api.getTransactionsForAddress({ address: params.address });
};

export const getTransactionData = (api: EthereumApi, txHash: string) => api.getTxInfo({ txHash });

export const ETHToolbox = ({
  ethplorerApiKey,
  signer,
  provider,
}: {
  ethplorerApiKey: string;
  signer?: Signer;
  provider: Provider | Web3Provider;
}) => {
  const api = new EthereumApi({ apiKey: ethplorerApiKey });

  return {
    ...BaseEVMToolbox({ signer, provider }),
    getTransactionData: (txHash: string) => getTransactionData(api, txHash),
    getTransactions: (params?: TxHistoryParams) => getTransactions(api, params),
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, api, address, assets),
  };
};
