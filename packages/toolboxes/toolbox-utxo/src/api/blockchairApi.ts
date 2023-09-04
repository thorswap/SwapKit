import { getRequest } from '@thorswap-lib/helpers';
import type { UTXO, UTXOChain } from '@thorswap-lib/types';
import { Chain } from '@thorswap-lib/types';

import type {
  BlockchairAddressResponse,
  BlockchairMultipleBalancesResponse,
  BlockchairOutputsResponse,
  BlockchairRawTransactionResponse,
  BlockchairResponse,
  ScanUTXOsParams,
} from '../types/index.ts';

type BlockchairParams<T> = T & { chain: Chain; apiKey?: string };

const baseUrl = (chain: Chain) => `https://api.blockchair.com/${mapChainToBlockchairChain(chain)}`;

const getDefaultTxFeeByChain = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return 127;
    case Chain.Dogecoin:
      return 10000000;
    default:
      return 2;
  }
};

const mapChainToBlockchairChain = (chain: Chain) => {
  switch (chain) {
    case Chain.BitcoinCash:
      return 'bitcoin-cash';
    case Chain.Litecoin:
      return 'litecoin';
    case Chain.Dogecoin:
      return 'dogecoin';
    default:
      return 'bitcoin';
  }
};

const getSuggestedTxFee = async (chain: Chain) => {
  // Skipped until internal API is using a more stable data provider
  // try {
  //   const response = await SwapKitApi.getGasRates();

  //   return response.find((gas) => gas.chainId === chainId)?.gas;
  //   throw new Error('Failed to get suggested txFee');
  // } catch (error) {
  try {
    //Use Bitgo API for fee estimation
    //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
    const { feePerKb } = await getRequest<{
      feePerKb: number;
      cpfpFeePerKb: number;
      numBlocks: number;
      feeByBlockTarget: { 1: number; 3: number };
    }>(`https://app.bitgo.com/api/v2/${chain.toLowerCase()}/tx/fee`);
    return feePerKb / 1000; // feePerKb to feePerByte
  } catch (error) {
    return getDefaultTxFeeByChain(chain);
  }
  //   }
};

const blockchairRequest = async <T extends any>(url: string): Promise<T> => {
  const response = await getRequest<BlockchairResponse<T>>(url);
  if (!response || response.context.code !== 200) throw new Error(`failed to query ${url}`);

  return response.data as T;
};

const getUnconfirmedBalance = async ({
  address,
  chain,
  apiKey,
}: BlockchairParams<{ address?: string }>) => {
  if (!address) throw new Error('address is required');

  const url = `/dashboards/address/${address}?transaction_details=true${
    apiKey ? `&key=${apiKey}` : ''
  }`;
  const response = await blockchairRequest<BlockchairAddressResponse>(`${baseUrl(chain)}${url}`);

  return response[address].address.balance;
};

const getConfirmedBalance = async ({
  chain,
  address,
  apiKey,
}: BlockchairParams<{ address?: string }>) => {
  if (!address) throw new Error('address is required');

  const url = `/addresses/balances?addresses=${address}${apiKey ? `&key=${apiKey}` : ''}`;
  const response = await blockchairRequest<BlockchairMultipleBalancesResponse>(
    `${baseUrl(chain)}${url}`,
  );

  return response[address] || 0;
};

const getRawTx = async ({ chain, apiKey, txHash }: BlockchairParams<{ txHash?: string }>) => {
  if (!txHash) throw new Error('txHash is required');

  const url = `/raw/transaction/${txHash}${apiKey ? `?key=${apiKey}` : ''}`;
  const rawTxResponse = await blockchairRequest<BlockchairRawTransactionResponse>(
    `${baseUrl(chain)}${url}`,
  );
  return rawTxResponse[txHash].raw_transaction;
};

const getUnspentTxs = async ({
  chain,
  address,
  apiKey,
  offset = 0,
}: BlockchairParams<{ offset?: number; address: string }>): Promise<
  (UTXO & { script_hex: string; is_confirmed: boolean })[]
> => {
  if (!address) throw new Error('address is required');
  const url = `/outputs?q=is_spent(false),recipient(${address})&limit=100&offset=${offset}${
    apiKey ? `&key=${apiKey}` : ''
  }`;
  const response = await blockchairRequest<BlockchairOutputsResponse[]>(`${baseUrl(chain)}${url}`);

  const txs = response
    .filter(({ is_spent }) => !is_spent)
    .map(({ script_hex, block_id, transaction_hash, index, value, spending_signature_hex }) => ({
      hash: transaction_hash,
      index,
      value,
      txHex: spending_signature_hex,
      script_hex,
      is_confirmed: block_id !== -1,
    })) as (UTXO & { script_hex: string; is_confirmed: boolean })[];

  if (response.length !== 100) return txs;

  const nextBatch = await getUnspentTxs({
    address,
    chain,
    apiKey,
    offset: response[99].transaction_id,
  });

  return txs.concat(nextBatch);
};

const scanUTXOs = async ({
  address,
  chain,
  apiKey,
  fetchTxHex = true,
}: BlockchairParams<ScanUTXOsParams>) => {
  const utxos = await getUnspentTxs({ chain, address, apiKey });
  const results = [];

  for (const { hash, index, script_hex, value } of utxos) {
    let txHex;
    if (fetchTxHex) {
      txHex = await getRawTx({ txHash: hash, chain, apiKey });
    }
    results.push({
      address,
      hash,
      index,
      txHex,
      value,
      witnessUtxo: { value, script: Buffer.from(script_hex, 'hex') },
    });
  }
  return results;
};

export const blockchairApi = ({ apiKey, chain }: { apiKey?: string; chain: UTXOChain }) => ({
  getConfirmedBalance: (address: string) => getConfirmedBalance({ chain, address, apiKey }),
  getRawTx: (txHash: string) => getRawTx({ txHash, chain, apiKey }),
  getSuggestedTxFee: () => getSuggestedTxFee(chain),
  getBalance: (address: string) => getUnconfirmedBalance({ address, chain, apiKey }),
  scanUTXOs: (params: ScanUTXOsParams) => scanUTXOs({ ...params, chain, apiKey }),
});

export type BlockchairApiType = ReturnType<typeof blockchairApi>;
