import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const LTCToolbox = (
  apiKey?: string,
  apiClientOrNodeUrl: BlockchairApiType | string = RPCUrl.Litecoin,
): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Litecoin,
    apiClient:
      typeof apiClientOrNodeUrl === 'string'
        ? blockchairApi({ apiKey, nodeUrl: apiClientOrNodeUrl, chain: Chain.Litecoin })
        : apiClientOrNodeUrl,
  });
