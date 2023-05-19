import { getRequest } from '@thorswap-lib/helpers';
import { Chain, UTXO } from '@thorswap-lib/types';

import {
  BlockchairAddressesParams,
  BlockchairAddressParams,
  BlockchairAddressResponse,
  BlockchairDashboardTransactionResponse,
  BlockchairMultipleBalancesResponse,
  BlockchairOutputsResponse,
  BlockchairRawTransactionResponse,
  BlockchairResponse,
  BlockchairTransactionParams,
} from '../types/blockchairApiTypes.js';

const BLOCKCHAIR_BASE_URL = 'https://api.blockchair.com';

const mapChainToBlockchairChain = (chain: Chain) => {
  switch (chain) {
    case Chain.BitcoinCash:
      return 'bitcoin-cash';
    case Chain.Litecoin:
      return 'litecoin';
    case Chain.Doge:
      return 'dogecoin';
    default:
      return 'bitcoin';
  }
};

const isErrorResponse = (response: any) => {
  return response.context.code !== 200;
};

export const getUnconfirmedBalance = async ({
  address,
  chain,
  apiKey,
}: BlockchairAddressParams): Promise<BlockchairAddressResponse> => {
  if (!address) throw new Error('address is required');
  const url = `${BLOCKCHAIR_BASE_URL}/${mapChainToBlockchairChain(
    chain,
  )}/dashboards/address/${address}?transaction_details=true${apiKey && '&key=' + apiKey}`;
  const response = await getRequest<BlockchairResponse<BlockchairAddressResponse>>(url);
  if (!response || isErrorResponse(response))
    throw new Error(`failed to query balance by address ${address}`);
  const balanceResponse = response.data;
  return balanceResponse;
};

export const getConfirmedBalance = async ({
  address,
  chain,
  apiKey,
}: BlockchairAddressParams): Promise<BlockchairMultipleBalancesResponse> => {
  return getConfirmedBalances({ addresses: [address], chain, apiKey });
};

export const getConfirmedBalances = async ({
  chain,
  addresses,
  apiKey,
}: BlockchairAddressesParams): Promise<BlockchairMultipleBalancesResponse> => {
  const url = `${BLOCKCHAIR_BASE_URL}/${mapChainToBlockchairChain(
    chain,
  )}/addresses/balances?addresses=${addresses.join(',')}${apiKey && '&key=' + apiKey}`;
  const response = await getRequest<BlockchairResponse<BlockchairMultipleBalancesResponse>>(url);
  if (!response || isErrorResponse(response))
    throw new Error(`failed to query balance by addresses ${addresses}`);
  const balanceResponse = response.data;
  return balanceResponse;
};

export const getUnspentTxs = async ({
  chain,
  address,
  apiKey,
  offset = 0,
}: BlockchairAddressParams & { offset?: number }): Promise<
  (UTXO & { script_hex: string; is_confirmed: boolean })[]
> => {
  if (!address) throw new Error('address is required');
  const url = `${BLOCKCHAIR_BASE_URL}/${mapChainToBlockchairChain(
    chain,
  )}/outputs?q=is_spent(false),recipient(${address})${
    apiKey && '&key=' + apiKey
  }&limit=100&offset=${offset}`;
  const response = await getRequest<BlockchairResponse<BlockchairOutputsResponse[]>>(url);
  if (!response || isErrorResponse(response))
    throw new Error(`failed to query unspent tx by address ${address}`);
  const txs: (UTXO & { script_hex: string; is_confirmed: boolean })[] = response.data
    .filter((item) => !item.is_spent)
    .map((utxo) => ({
      hash: utxo.transaction_hash,
      index: utxo.index,
      value: utxo.value,
      txHex: utxo.spending_signature_hex || undefined,
      script_hex: utxo.script_hex,
      is_confirmed: utxo.block_id !== -1,
    }));
  if (response.data.length === 100) {
    //fetch the next batch
    const offset = response.data[99].transaction_id;

    const nextBatch = await getUnspentTxs({ address, chain, apiKey, offset });
    return txs.concat(nextBatch);
  } else {
    return txs;
  }
};

export const getTx = async ({
  chain,
  apiKey,
  txHash,
}: BlockchairTransactionParams): Promise<BlockchairDashboardTransactionResponse> => {
  if (!txHash) throw new Error('txHash is required');
  const url = `${BLOCKCHAIR_BASE_URL}/${mapChainToBlockchairChain(
    chain,
  )}/dashboards/transaction/${txHash}${apiKey && '?key=' + apiKey}`;
  const response = await getRequest<BlockchairResponse<BlockchairDashboardTransactionResponse>>(
    url,
  );
  if (!response || isErrorResponse(response)) throw new Error(`failed to tx by hash ${txHash}`);
  return response.data;
};

export const getRawTx = async ({
  chain,
  apiKey,
  txHash,
}: BlockchairTransactionParams): Promise<BlockchairRawTransactionResponse> => {
  if (!txHash) throw new Error('txHash is required');
  const url = `${BLOCKCHAIR_BASE_URL}/${mapChainToBlockchairChain(
    chain,
  )}/raw/transaction/${txHash}${apiKey && '?key=' + apiKey}`;
  const response = await getRequest<BlockchairResponse<BlockchairRawTransactionResponse>>(url);
  if (!response || isErrorResponse(response)) throw new Error(`failed to tx by hash ${txHash}`);
  return response.data;
};

export const scanUTXOs = async ({
  address,
  chain,
  apiKey,
  fetchTxHex = true,
}: BlockchairAddressParams & { fetchTxHex: boolean }): Promise<UTXO[]> => {
  const utxos = await getUnspentTxs({
    chain,
    address,
    apiKey,
  });

  const results: UTXO[] = [];
  for (const utxo of utxos) {
    const { hash, index, value } = utxo;
    let txHex;
    if (fetchTxHex) {
      txHex = (await getRawTx({ txHash: utxo.hash, chain, apiKey }))[utxo.hash].raw_transaction;
    }
    results.push({
      hash,
      index,
      value,
      witnessUtxo: {
        value,
        script: Buffer.from(utxo.script_hex, 'hex'),
      },
      txHex,
    });
  }
  return results;
};
