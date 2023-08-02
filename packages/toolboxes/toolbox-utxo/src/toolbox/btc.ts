import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const BTCToolbox = (
  apiKey?: string,
  apiClientOrNodeUrl: BlockchairApiType | string = RPCUrl.Bitcoin,
) =>
  BaseUTXOToolbox({
    chain: Chain.Bitcoin,
    apiClient:
      typeof apiClientOrNodeUrl === 'string'
        ? blockchairApi({ apiKey, nodeUrl: apiClientOrNodeUrl, chain: Chain.Bitcoin })
        : apiClientOrNodeUrl,
  });
