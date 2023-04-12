import { BigNumber } from '@ethersproject/bignumber';
import { assetFromString, baseAmount, getRequest } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Balance, Chain, ChainId, Tx, TxsPage, TxType } from '@thorswap-lib/types';

import { EvmApi } from '../types/Api.js';
import { CovalentBalanceResponse, CovalentTransactionResponse } from '../types/covalentApiTypes.js';

const COVALENT_BASE_URL = 'https://api.covalenthq.com/v1';

export interface BaseRequestParams {
  chainId: ChainId;
  apiKey?: string;
}

export interface TokenBalanceRequestParams extends BaseRequestParams {
  address: string;
}

export interface TxInfoRequestParams extends BaseRequestParams {
  txHash: string;
}

export interface TransactionsRequestParams extends BaseRequestParams {
  address: string;
  page?: number;
  pageSize?: number;
}

type RequestParams = TransactionsRequestParams | TokenBalanceRequestParams | TxInfoRequestParams;

export class CovalentApi implements EvmApi<RequestParams> {
  private apiKey: string;

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  /**
   * Get transaction by hash.
   */
  getTxInfo = async ({ txHash, chainId }: TxInfoRequestParams): Promise<Tx> => {
    const response = await getRequest<any>(
      `${COVALENT_BASE_URL}/${chainId}/transaction_v2/${txHash}`,
      { key: this.apiKey },
    );
    return mapTxDataResponseToTx(response);
  };

  getTransactionsForAddress = async ({
    address,
    chainId,
    page,
    pageSize,
  }: TransactionsRequestParams): Promise<TxsPage> =>
    await getRequest<TxsPage>(
      `${COVALENT_BASE_URL}/${chainId}/address/${address}/transactions_v2/`,
      {
        key: this.apiKey,
        'page-size': pageSize,
        page: page,
      },
    );

  /**
   * Get token balance
   */
  getBalance = async ({ address, chainId }: TokenBalanceRequestParams): Promise<Balance[]> => {
    const response = await getRequest<{ data: CovalentBalanceResponse }>(
      `${COVALENT_BASE_URL}/${chainId}/address/${address}/balances_v2/`,
      { key: this.apiKey },
    );

    return mapBalanceResponseToBalance(response.data || { items: [] });
  };
}

const mapBalanceResponseToBalance = async (data: CovalentBalanceResponse): Promise<Balance[]> => {
  const balances = data.items
    .map(({ balance, contract_decimals, contract_ticker_symbol, contract_address }) => ({
      amount: baseAmount(BigNumber.from(balance.toString()), contract_decimals),
      asset:
        (contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
          assetFromString(`AVAX.${contract_ticker_symbol}-${contract_address}`)) ||
        getSignatureAssetFor(Chain.Avalanche),
    }))
    .filter(
      ({ asset: { chain, symbol, ticker } }) =>
        !(chain === Chain.Avalanche && symbol === chain && ticker === chain),
    );

  return balances;
};

const mapTxDataResponseToTx = async ({
  items: [{ tx_hash, value, from_address, to_address }],
}: CovalentTransactionResponse): Promise<Tx> => ({
  asset: getSignatureAssetFor(Chain.Avalanche),
  date: new Date(),
  from: [{ from: from_address, amount: baseAmount(BigNumber.from(value.toString())) }],
  hash: tx_hash,
  to: [{ to: to_address, amount: baseAmount(BigNumber.from(value.toString())) }],
  type: TxType.Transfer,
});
