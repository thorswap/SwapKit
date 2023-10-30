import { RequestClient } from '@swapkit/helpers';

import { uniqid } from '../index.ts';

export const broadcastUTXOTx = async ({ txHash, rpcUrl }: { txHash: string; rpcUrl: string }) => {
  const response = await RequestClient.post<{ id: string; result: string; error: string | null }>(
    rpcUrl,
    {
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'sendrawtransaction',
        params: [txHash],
        id: uniqid(),
      }),
    },
  );

  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`);
  }

  if (response.result.includes('"code":-26')) {
    throw new Error('Invalid transaction: the transaction amount was too low');
  }

  return response.result;
};
