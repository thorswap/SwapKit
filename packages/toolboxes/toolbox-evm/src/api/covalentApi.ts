import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { AssetValue, getRequest } from '@thorswap-lib/swapkit-helpers';
import type { ChainId } from '@thorswap-lib/types';
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
): Promise<AssetValue[]> =>
  data.items
    .map(
      ({ balance, contract_decimals, contract_ticker_symbol, contract_address }) =>
        new AssetValue({
          value: BigInt(balance),
          decimal: contract_decimals,
          ...{
            chain: ChainIdToChain[chainId],
            symbol: `${ChainIdToChain[chainId]}.${contract_ticker_symbol}-${contract_address}`,
          },
        }),
    )
    //     {
    //   amount: new SwapKitNumber(balance.toString()), contract_decimals),
    //   asset:
    //     (contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
    //       assetFromString(
    //         `${ChainIdToChain[chainId]}.${contract_ticker_symbol}-${contract_address}`,
    //       )) ||
    //     getSignatureAssetFor(ChainIdToChain[chainId]),
    // }))
    .filter(({ symbol, ticker }) => {
      const signatureAsset = getSignatureAssetFor(ChainIdToChain[chainId]);
      return !(symbol === signatureAsset.symbol && ticker === signatureAsset.ticker);
    });
