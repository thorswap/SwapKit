import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const DOGEToolbox = (
  apiKey?: string,
  apiClientOrNodeUrl: BlockchairApiType | string = RPCUrl.Dogecoin,
): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Dogecoin,
    apiClient:
      typeof apiClientOrNodeUrl === 'string'
        ? blockchairApi({ apiKey, nodeUrl: apiClientOrNodeUrl, chain: Chain.Dogecoin })
        : apiClientOrNodeUrl,
  });
