import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, TxHistoryParams } from '@thorswap-lib/types';

import { EthereumApi } from '../api/eth/EthereumHybridApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (
  provider: Provider,
  api: EthereumApi,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance({ address });
  const evmGasTokenBalance: BigNumber = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ETH);

  if (!assets) {
    return [{ asset: AssetEntity.ETH(), amount: evmGasTokenBalanceAmount }, ...tokenBalances];
  }

  return tokenBalances.filter(({ asset }) =>
    assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
  );
};

export const getTransactions = async (api: EthereumApi, params?: TxHistoryParams) => {
  if (!params?.address) throw new Error('address is required');
  const transactions = await api.getTransactionsForAddress({
    address: params.address,
  });
  return transactions;
};

export const getTransactionData = (api: EthereumApi, txId: string) => api.getTxInfo({ hash: txId });

export const ETHToolbox = ({
  ethplorerApiKey,
  signer,
  provider,
}: {
  ethplorerApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const api = new EthereumApi({ apiKey: ethplorerApiKey });

  return {
    ...BaseEVMToolbox({ signer, provider }),
    getTransactionData: (txId: string) => getTransactionData(api, txId),
    getTransactions: (params?: TxHistoryParams) => getTransactions(api, params),
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, api, address, assets),
  };
};
