import type {
  BaseUTXOToolbox,
  UTXOToolbox,
  UTXOTransferParams,
  UTXOType,
} from '@swapkit/toolbox-utxo';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@swapkit/toolbox-utxo';
import type { UTXOChain } from '@swapkit/types';
import { Chain, FeeOption } from '@swapkit/types';
import { toCashAddress } from 'bchaddrjs';
import type { Psbt } from 'bitcoinjs-lib';

import { addressInfoForCoin, Coin } from '../coins.ts';

type Params = {
  sdk: any;
  chain: UTXOChain;
  apiKey?: string;
  apiClient?: ReturnType<typeof BaseUTXOToolbox>['apiClient'];
};

const getToolbox = ({ chain, apiClient, apiKey }: Omit<Params, 'sdk'>) => {
  switch (chain) {
    case Chain.Bitcoin:
      return { toolbox: BTCToolbox({ apiClient, apiKey }), segwit: true };
    case Chain.Litecoin:
      return { toolbox: LTCToolbox({ apiClient, apiKey }), segwit: true };
    case Chain.Dogecoin:
      return { toolbox: DOGEToolbox({ apiClient, apiKey }), segwit: false };
    case Chain.BitcoinCash:
      return { toolbox: BCHToolbox({ apiClient, apiKey }), segwit: false };
  }
};

export const utxoWalletMethods = async ({
  sdk,
  chain,
  apiKey,
  apiClient,
}: Params): Promise<
  UTXOToolbox & {
    getAddress: () => string;
    signTransaction: (psbt: Psbt, inputs: UTXOType[], memo?: string) => Promise<string>;
    transfer: (params: UTXOTransferParams) => Promise<string>;
  }
> => {
  if (!apiKey && !apiClient) throw new Error('UTXO API key not found');
  const { toolbox, segwit } = getToolbox({ chain, apiClient, apiKey });

  const scriptType = segwit ? 'p2wpkh' : 'p2pkh';
  const addressInfo = addressInfoForCoin(chain, false, scriptType);
  const { address: walletAddress } = await sdk.address.utxoGetAddress(addressInfo);

  const signTransaction = async (psbt: Psbt, inputs: UTXOType[], memo: string = '') => {
    const outputs = psbt.txOutputs
      .map(
        // @ts-expect-error TODO: @Highlander - fix typing
        ({ value, address, change }) => {
          const outputAddress =
            chain === Chain.BitcoinCash && address
              ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(toCashAddress(address))
              : address;

          if (change || address === walletAddress) {
            return {
              addressNList: addressInfo.address_n,
              isChange: true,
              addressType: 'change',
              amount: value,
              scriptType,
            };
          } else {
            if (outputAddress) {
              return { address: outputAddress, amount: value, addressType: 'spend' };
            } else {
              //else opReturn DO NOT ADD
              //HDwallet will handle opReturn do not send as an output to keepkey
              return null;
            }
          }
        },
      )
      .filter(Boolean);

    const responseSign = await sdk.utxo.utxoSignTransaction({
      coin: Coin[chain as keyof typeof Coin],
      inputs,
      outputs,
      version: 1,
      locktime: 0,
      opReturnData: memo,
    });
    return responseSign.serializedTx;
  };

  const transfer = async ({
    from,
    recipient,
    feeOptionKey,
    feeRate,
    memo,
    ...rest
  }: UTXOTransferParams) => {
    if (!from) throw new Error('From address must be provided');
    if (!recipient) throw new Error('Recipient address must be provided');

    const { psbt, inputs: rawInputs } = await toolbox.buildTx({
      ...rest,
      memo,
      feeOptionKey,
      recipient,
      feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
      sender: from,
      fetchTxHex: chain,
    });

    const inputs = rawInputs.map(({ value, index, hash, txHex }) => ({
      //@TODO don't hardcode master, lookup on blockbook what input this is for and what path that address is!
      addressNList: addressInfo.address_n,
      scriptType,
      value,
      index,
      hash,
      hex: txHex,
    }));

    const txHex = await signTransaction(psbt, inputs, memo);
    return toolbox.broadcastTx(txHex);
  };

  return { ...toolbox, getAddress: () => walletAddress as string, signTransaction, transfer };
};
