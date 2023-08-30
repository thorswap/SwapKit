import { postRequest } from '@thorswap-lib/helpers';

import { uniqid } from '../index.js';

export const broadcastTx = async ({ txHash, rpcUrl }: { txHash: string; rpcUrl: string }) => {
  const response = await postRequest<{ id: string; result: string; error: string | null }>(
    rpcUrl,
    JSON.stringify({
      jsonrpc: '2.0',
      method: 'sendrawtransaction',
      params: [txHash],
      id: uniqid(),
    }),
    { 'Content-Type': 'application/json', Accept: 'application/json' },
  );

  if (response.error) {
    throw new Error(`failed to broadcast a transaction: ${response.error}`);
  }

  if (response.result.includes('"code":-26')) {
    throw new Error('Invalid transaction: the transaction amount was too low');
  }

  return response.result;
};
