import { getRequest } from '@swapkit/helpers';
import { Chain, type UTXOChain } from '@swapkit/types';

import type {
  BlockchairAddressResponse,
  BlockchairMultipleBalancesResponse,
  BlockchairOutputsResponse,
  BlockchairRawTransactionResponse,
  BlockchairResponse,
  UTXOType,
} from '../types/index.ts';
type BlockchairParams<T> = T & { chain: Chain; apiKey?: string };

const baseUrl = (chain: Chain) => `https://api.blockchair.com/${mapChainToBlockchairChain(chain)}`;

const getDefaultTxFeeByChain = (chain: Chain) => {
  switch (chain) {
    case Chain.Bitcoin:
      return 127;
    case Chain.Dogecoin:
      return 10000000;
    case Chain.Litecoin:
      return 1000;
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
    const suggestedFee = feePerKb / 1000;

    return Math.max(suggestedFee, getDefaultTxFeeByChain(chain));
  } catch (error) {
    return getDefaultTxFeeByChain(chain);
  }
};

const blockchairRequest = async <T extends any>(url: string): Promise<T> => {
  const response = await getRequest<BlockchairResponse<T>>(url);
  if (!response || response.context.code !== 200) throw new Error(`failed to query ${url}`);

  return response.data as T;
};

const getAddressData = async ({
  address,
  chain,
  apiKey,
}: BlockchairParams<{ address?: string }>) => {
  if (!address) throw new Error('address is required');

  try {
    const url = `/dashboards/address/${address}?transaction_details=true${
      apiKey ? `&key=${apiKey}` : ''
    }`;
    const response = await blockchairRequest<BlockchairAddressResponse>(`${baseUrl(chain)}${url}`);

    return response[address];
  } catch (error) {
    return {
      utxo: [],
      address: {
        balance: 0,
        transaction_count: 0,
      },
    };
  }
};

const getUnconfirmedBalance = async ({
  address,
  chain,
  apiKey,
}: BlockchairParams<{ address?: string }>) => {
  return (await getAddressData({ address, chain, apiKey })).address.balance;
};

const getConfirmedBalance = async ({
  chain,
  address,
  apiKey,
}: BlockchairParams<{ address?: string }>) => {
  if (!address) throw new Error('address is required');
  try {
    const url = `/addresses/balances?addresses=${address}${apiKey ? `&key=${apiKey}` : ''}`;
    const response = await blockchairRequest<BlockchairMultipleBalancesResponse>(
      `${baseUrl(chain)}${url}`,
    );

    return response[address] || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const getRawTx = async ({ chain, apiKey, txHash }: BlockchairParams<{ txHash?: string }>) => {
  if (!txHash) throw new Error('txHash is required');

  try {
    const url = `/raw/transaction/${txHash}${apiKey ? `?key=${apiKey}` : ''}`;
    const rawTxResponse = await blockchairRequest<BlockchairRawTransactionResponse>(
      `${baseUrl(chain)}${url}`,
    );
    return rawTxResponse[txHash].raw_transaction;
  } catch (error) {
    console.error(error);
    return '';
  }
};

const getUnspentTxs = async ({
  chain,
  address,
  apiKey,
  offset = 0,
}: BlockchairParams<{ offset?: number; address: string }>): Promise<
  (UTXOType & { script_hex: string; is_confirmed: boolean })[]
> => {
  if (!address) throw new Error('address is required');
  try {
    const url = `/outputs?q=is_spent(false),recipient(${address})&limit=100&offset=${offset}${
      apiKey ? `&key=${apiKey}` : ''
    }`;
    const response = await blockchairRequest<BlockchairOutputsResponse[]>(
      `${baseUrl(chain)}${url}`,
    );

    const txs = response
      .filter(({ is_spent }) => !is_spent)
      .map(({ script_hex, block_id, transaction_hash, index, value, spending_signature_hex }) => ({
        hash: transaction_hash,
        index,
        value,
        txHex: spending_signature_hex,
        script_hex,
        is_confirmed: block_id !== -1,
      })) as (UTXOType & { script_hex: string; is_confirmed: boolean })[];

    if (response.length !== 100) return txs;

    const nextBatch = await getUnspentTxs({
      address,
      chain,
      apiKey,
      offset: response[99].transaction_id,
    });

    return txs.concat(nextBatch);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const scanUTXOs = async ({
  address,
  chain,
  apiKey,
  fetchTxHex = true,
}: BlockchairParams<{ address: string; fetchTxHex?: boolean }>) => {
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
  getAddressData: (address: string) => getAddressData({ address, chain, apiKey }),
  scanUTXOs: (params: { address: string; fetchTxHex?: boolean }) =>
    scanUTXOs({ ...params, chain, apiKey }),
});

export type BlockchairApiType = ReturnType<typeof blockchairApi>;
