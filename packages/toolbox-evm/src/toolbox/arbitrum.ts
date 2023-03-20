import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, RPCUrl, TxHistoryParams } from '@thorswap-lib/types';

import { BaseEVMToolbox, CovalentApi } from '../index.js';

const ARBITRUM_CHAIN_ID = ChainId.Arbitrum;

export const getBalance = async (
  provider: Provider,
  api: CovalentApi,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance({
    address: address,
    chainId: ARBITRUM_CHAIN_ID,
  });

  const evmGasTokenBalance: BigNumber = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ETH);

  if (assets) {
    return tokenBalances.filter((balance) =>
      assets.find(
        (asset) => asset.chain === balance.asset.chain && asset.symbol === balance.asset.symbol,
      ),
    );
  }
  return [
    {
      asset: getSignatureAssetFor(Chain.Arbitrum),
      amount: evmGasTokenBalanceAmount,
    },
    ...tokenBalances,
  ];
};

export const getTransactions = async (api: CovalentApi, params?: TxHistoryParams) => {
  if (!params?.address) throw new Error('address is required');
  const transactions = await api.getTransactionsForAddress({
    address: params.address,
    chainId: ARBITRUM_CHAIN_ID,
  });
  return transactions;
};

export const getTransactionData = async (api: CovalentApi, txHash: string) =>
  api.getTxInfo({ txHash, chainId: ARBITRUM_CHAIN_ID });

export const getNetworkParams = () => ({
  chainId: ARBITRUM_CHAIN_ID,
  chainName: 'Arbitrum',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'AETH',
    decimals: 18,
  },
  rpcUrls: [RPCUrl.Arbitrum],
  blockExplorerUrls: ['https://arb1.arbitrum.io/rpc'],
});

export const ARBToolbox = ({
  provider,
  signer,
  covalentApiKey,
}: {
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const api = new CovalentApi({ apiKey: covalentApiKey });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getTransactionData: (txId: string) => getTransactionData(api, txId),
    getTransactions: (params?: TxHistoryParams) => getTransactions(api, params),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, api, address, assets),
  };
};
