import { BigNumber } from '@ethersproject/bignumber';
import { assetFromString, baseAmount, getRequest } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import type { Balance, ChainId } from '@thorswap-lib/types';
import { ChainIdToChain } from '@thorswap-lib/types';

type CovalentBalanceResponse = {
  address: string;
  updated_at: string;
  next_updated_at: string;
  quote_currency: string;
  items: {
    contract_decimals: number;
    contract_name: string;
    contract_ticker_symbol: string;
    contract_address: string;
    supports_erc: null | any[];
    logo_url: string;
    last_transferred_at: string;
    native_token: boolean;
    type: string;
    balance: number;
    balance_24h: number;
    quote_rate: number;
    quote_rate_24h: number;
    quote: number;
    quote_24h: number;
  }[];
};

export const covalentApi = ({ apiKey, chainId }: { apiKey: string; chainId: ChainId }) => ({
  getBalance: async (address: string) => {
    const { data } = await getRequest<{ data: CovalentBalanceResponse }>(
      `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`,
      { key: apiKey },
    );

    return mapBalanceResponseToBalance(data || { items: [] }, chainId);
  },
});

export type CovalentApiType = ReturnType<typeof covalentApi>;

const mapBalanceResponseToBalance = async (
  data: CovalentBalanceResponse,
  chainId: ChainId,
): Promise<Balance[]> =>
  data.items
    .map(({ balance, contract_decimals, contract_ticker_symbol, contract_address }) => ({
      amount: baseAmount(BigNumber.from(balance.toString()), contract_decimals),
      asset:
        (contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
          assetFromString(
            `${ChainIdToChain[chainId]}.${contract_ticker_symbol}-${contract_address}`,
          )) ||
        getSignatureAssetFor(ChainIdToChain[chainId]),
    }))
    .filter(({ asset: { symbol, ticker } }) => {
      const signatureAsset = getSignatureAssetFor(ChainIdToChain[chainId]);
      return !(symbol === signatureAsset.symbol && ticker === signatureAsset.ticker);
    });
