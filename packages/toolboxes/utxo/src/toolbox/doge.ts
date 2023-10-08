import { Chain, RPCUrl } from '@swapkit/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import { blockchairApi } from '../api/blockchairApi.ts';
import { broadcastUTXOTx } from '../api/rpcApi.ts';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.ts';

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
    broadcastTx: (txHash: string) => broadcastUTXOTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Dogecoin }),
  });
