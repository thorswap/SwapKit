import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';
import { broadcastTx } from '../api/rpcApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const DOGEToolbox = ({
  apiKey,
  rpcUrl = RPCUrl.Dogecoin,
  apiClient,
}: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Dogecoin,
    broadcastTx: (txHash: string) => broadcastTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Dogecoin }),
  });
