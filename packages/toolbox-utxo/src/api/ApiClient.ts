import { baseAmount, postRequest } from '@thorswap-lib/helpers';
import { AmountWithBaseDenom, BaseDecimal, Chain } from '@thorswap-lib/types';
import uniqid from 'uniqid';

import {
  AddressBalance,
  ApiClientParams,
  BroadcastTxParams,
  CommonScanUTXOParam,
  TxBroadcastResponse,
} from '../types/index.js';

import {
  getConfirmedBalance,
  getRawTx,
  getTx,
  getUnconfirmedBalance,
  getUnspentTxs,
  scanUTXOs,
} from './blockchair-api.js';
import { getSuggestedTxFee } from './helpers.js';

export class ApiClient {
  chain: Chain;
  protected nodeUrl: string;
  private apiKey: string | undefined;

  constructor({ chain, apiKey, nodeUrl }: ApiClientParams) {
    if (![Chain.Bitcoin, Chain.BitcoinCash, Chain.Doge, Chain.Litecoin].includes(chain)) {
      throw new Error('invalid chain');
    }

    this.apiKey = apiKey;
    this.chain = chain;
    this.nodeUrl = nodeUrl;
  }

  getAddress = (address: string) => {
    return getUnconfirmedBalance({ apiKey: this.apiKey, address, chain: this.chain });
  };

  getBalance = async ({ address }: { address: string }): Promise<AddressBalance> => {
    const balanceResponse = await getUnconfirmedBalance({
      address,
      chain: this.chain,
      apiKey: this.apiKey,
    });
    const confirmedBalanceResponse = await getConfirmedBalance({
      address,
      chain: this.chain,
      apiKey: this.apiKey,
    });
    const confirmedBalance = confirmedBalanceResponse[address] || 0;
    const unconfirmedBalance = balanceResponse[address].address.balance - confirmedBalance;

    return {
      address,
      confirmed: baseAmount(confirmedBalance, BaseDecimal.THOR),
      unconfirmed: baseAmount(unconfirmedBalance, BaseDecimal.THOR),
    };
  };

  getBalanceAmount = async ({ address }: { address: string }): Promise<AmountWithBaseDenom> => {
    const balance = await this.getBalance({ address });

    return balance.confirmed.plus(balance.unconfirmed);
  };

  getUnspentTxs = async (address: string) => {
    return getUnspentTxs({ chain: this.chain, apiKey: this.apiKey, address });
  };

  getConfirmedUnspentTxs = async (address: string) => {
    return (await this.getUnspentTxs(address)).filter((utxo) => utxo.is_confirmed);
  };

  getSuggestedTxFee = () => getSuggestedTxFee(this.chain);

  getIsTxConfirmed = async (txHash: string) => {
    const response = await getTx({ chain: this.chain, apiKey: this.apiKey, txHash });
    return response[txHash].transaction.block_id !== -1;
  };

  getRawTx = async (txHash: string) => {
    return (await getRawTx({ txHash, chain: this.chain, apiKey: this.apiKey }))[txHash]
      .raw_transaction;
  };

  scanUTXOs = async ({ address, fetchTxHex }: CommonScanUTXOParam) =>
    scanUTXOs({
      address,
      chain: this.chain,
      fetchTxHex,
      apiKey: this.apiKey,
    });

  broadcastTx = async ({ txHex }: BroadcastTxParams) => {
    const response: TxBroadcastResponse = await postRequest(
      this.nodeUrl,
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'sendrawtransaction',
        params: [txHex],
        id: uniqid(),
      }),
      {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
}
