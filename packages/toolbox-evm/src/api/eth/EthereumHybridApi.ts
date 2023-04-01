import { getAddress } from '@ethersproject/address';
import { parseUnits } from '@ethersproject/units';
import { assetFromString, baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Balance, Chain, Tx, TxType } from '@thorswap-lib/types';

import {
  EvmApi,
  FullBalanceParams,
  GetTransactionsForAddressParam,
  GetTxInfoParam,
  TokenBalanceParam,
  TransactionInfo,
} from '../../types/index.js';

import {
  getAddress as getEthplorerAddress,
  getAddressTransactions,
  getTxInfo,
} from './ethplorerApi.js';

type RequestParams =
  | TokenBalanceParam
  | FullBalanceParams
  | GetTxInfoParam
  | GetTransactionsForAddressParam;

export class EthereumApi implements EvmApi<RequestParams> {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor({
    apiKey,
    baseUrl = 'https://api.ethplorer.io',
  }: {
    apiKey: string;
    baseUrl?: string;
  }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  getTxInfo = async ({ txHash }: GetTxInfoParam): Promise<Tx> => {
    const txInfo = await getTxInfo({ baseUrl: this.baseUrl, txHash, apiKey: this.apiKey });

    return mapTxInfoToTx(txInfo);
  };

  getTransactionsForAddress = async (params: GetTransactionsForAddressParam) => {
    const txInfos = await getAddressTransactions({
      ...params,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
    });
    return {
      total: txInfos.length,
      txs: txInfos.map((txinfo) => mapTxInfoToTx(txinfo)),
    };
  };

  getBalance = async ({ address }: FullBalanceParams): Promise<Balance[]> => {
    const account = await getEthplorerAddress({
      address,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
    });

    const tokenBalances = account.tokens
      ? account.tokens.reduce((acc, token) => {
          const { symbol, decimals, address } = token.tokenInfo;
          const tokenAsset = assetFromString(`${Chain.Ethereum}.${symbol}-${getAddress(address)}`);
          if (tokenAsset) {
            return [
              ...acc,
              { asset: tokenAsset, amount: baseAmount(token.rawBalance, parseInt(decimals)) },
            ];
          }
          return acc;
        }, [] as Balance[])
      : [];

    return Promise.all(tokenBalances);
  };
}

const mapTxInfoToTx = ({ hash, from, to, value }: TransactionInfo): Tx => ({
  hash,
  from: [{ from, amount: baseAmount(parseUnits(value.toString(), 'ether')) }],
  to: [{ to, amount: baseAmount(parseUnits(value.toString(), 'ether')) }],
  asset: AssetEntity.ETH(),
  type: TxType.Transfer,
  date: new Date(),
});
