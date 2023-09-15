import { assetFromString, AssetValue, getRequest } from '@thorswap-lib/swapkit-helpers';
import { Chain } from '@thorswap-lib/types';

import type { AddressInfo } from '../types/ethplorer-api-types.ts';
const baseUrl = 'https://api.ethplorer.io';

export const ethplorerApi = (apiKey = 'freekey') => ({
  getBalance: async (address: string) => {
    const { getAddress } = await import('ethers/address');
    const { tokens } = await getRequest<AddressInfo>(`${baseUrl}/getAddressInfo/${address}`, {
      apiKey,
    });

    return tokens
      ? tokens.reduce((acc, token) => {
          const { symbol, decimals, address } = token.tokenInfo;

          const tokenAsset = assetFromString(`${Chain.Ethereum}.${symbol}-${getAddress(address)}`);
          if (tokenAsset) {
            return [
              ...acc,
              new AssetValue({
                chain: tokenAsset.chain,
                symbol: tokenAsset.symbol,
                value: token.rawBalance,
                decimal: parseInt(decimals),
              }),
            ];
          }
          return acc;
        }, [] as AssetValue[])
      : [];
  },
});

export type EthplorerApiType = ReturnType<typeof ethplorerApi>;
