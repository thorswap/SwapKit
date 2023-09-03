import { Chain, RPCUrl } from '@thorswap-lib/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import { blockchairApi } from '../api/blockchairApi.ts';
import { broadcastTx } from '../api/rpcApi.ts';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.ts';

export const LTCToolbox = ({
  apiKey,
  rpcUrl = RPCUrl.Litecoin,
  apiClient,
}: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Litecoin,
    broadcastTx: (txHash: string) => broadcastTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Litecoin }),
  });
