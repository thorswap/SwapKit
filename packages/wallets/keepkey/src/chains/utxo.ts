import { BigNumber } from '@ethersproject/bignumber';
// @ts-ignore
import { addressInfoForCoin, COIN_MAP_KEEPKEY_LONG } from '@pioneer-platform/pioneer-coins';
import type { UTXOTransferParams } from '@thorswap-lib/toolbox-utxo';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import type { UTXO } from '@thorswap-lib/types';
import { Chain, FeeOption } from '@thorswap-lib/types';
import { toCashAddress } from 'bchaddrjs';
import type { Psbt } from 'bitcoinjs-lib';

export const utxoWalletMethods: any = async function (params: any) {
  try {
    let { sdk, chain, utxoApiKey, api, derivationPath } = params;
    console.log('derivationPath: ', derivationPath);
    if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
    let toolbox: any = {};
    let isSegwit = false;
    const toolboxParams = { api, apiKey: utxoApiKey };
    switch (chain) {
      case Chain.Bitcoin:
        isSegwit = true;
        toolbox = BTCToolbox(toolboxParams);
        break;
      case Chain.Litecoin:
        isSegwit = true;
        toolbox = LTCToolbox(toolboxParams);
        break;
      case Chain.Dogecoin:
        toolbox = DOGEToolbox(toolboxParams);
        break;
      case Chain.BitcoinCash:
        toolbox = BCHToolbox(toolboxParams);
        break;
      default:
        throw Error('unsupported chain! ' + chain);
    }
    const utxoMethods = toolbox;
    //getAddress
    const getAddress = async function () {
      try {
        //TODO custom script types?
        let scriptType;
        if (isSegwit) {
          scriptType = 'p2wpkh';
        } else {
          scriptType = 'p2pkh';
        }
        let addressInfo = addressInfoForCoin(chain, false, scriptType);
        console.log('addressInfo', addressInfo);
        let response = await sdk.address.utxoGetAddress(addressInfo);
        return response.address;
      } catch (e) {
        console.error(e);
      }
    };
    const address = await getAddress();

    const signTransaction = async (psbt: Psbt, inputs: UTXO[], memo: string = '') => {
      let outputs: any[] = psbt.txOutputs.map((output: any) => {
        console.log('output: ', output);
        let outputAddress = output.address;

        if (chain === Chain.BitcoinCash && output.address) {
          outputAddress = toCashAddress(output.address);
        }

        if (chain === Chain.BitcoinCash && outputAddress) {
          const strippedAddress = (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(
            outputAddress,
          );
          outputAddress = strippedAddress === address;
        } else {
          outputAddress = outputAddress === address;
        }
        if (output.change) {
          return {
            addressNList: isSegwit
                ? [2147483732, 2147483648, 2147483648, 0, 0]
                : [2147483692, 2147483648, 2147483648, 0, 0],
            isChange: true,
            addressType: 'change',
            amount: output.value,
            scriptType: isSegwit ? 'p2pkh' : 'p2wpkh',
          };
        }

        return {
          address: outputAddress,
          amount: BigNumber.from(output.value || 0),
          addressType: 'spend',
          script_type: 'PAYTOADDRESS',
        };
      });
      let outputsKeepKey = [];
      for (const output of outputs) {
        const outputKeepKey: any = {
          addressType: output.addressType,
          amount: output.amount.toString(),
        };
        if (output.address) outputKeepKey.address = output.address;
        if (output.isChange) {
          outputKeepKey.isChange = true;
          (outputKeepKey.addressNList = isSegwit
            ? [2147483732, 2147483648, 2147483648, 0, 0]
            : [2147483692, 2147483648, 2147483648, 0, 0]), //@TODO don't hardcode master, lookup new index blockbook! address re-use bad, shame!
            (outputKeepKey.scriptType = isSegwit ? 'p2wpkh' : 'p2pkh');
        }
        outputsKeepKey.push(outputKeepKey);
      }
      outputs = outputsKeepKey;

      let txToSign: any = {
        coin: COIN_MAP_KEEPKEY_LONG[chain],
        inputs,
        outputs,
        version: 1,
        locktime: 0,
      };
      if (memo) {
        txToSign.opReturnData = Buffer.from(memo, 'utf-8');
      }
      console.log('txToSign:', txToSign);
      let responseSign = await sdk.utxo.utxoSignTransaction(txToSign);
      console.log('responseSign:', responseSign);
      return responseSign.serializedTx;
    };

    const transfer: any = async ({
      from,
      recipient,
      feeOptionKey,
      feeRate,
      memo,
      ...rest
    }: UTXOTransferParams) => {
      if (!from) throw new Error('From address must be provided');
      if (!recipient) throw new Error('Recipient address must be provided');
      let { psbt, inputs } = await toolbox.buildTx({
        ...rest,
        memo,
        feeOptionKey,
        recipient,
        feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
        sender: from,
        fetchTxHex: chain,
      });
      console.log('psbt: ', psbt);
      console.log('inputs: ', inputs);

      //convert inputs for keepkey
      let inputsKeepKey = [];
      for (const input of inputs) {
        const inputKeepKey: any = {
          addressNList: isSegwit
            ? [2147483732, 2147483648, 2147483648, 0, 0]
            : [2147483692, 2147483648, 2147483648, 0, 0], //@TODO don't hardcode master, lookup on blockbook what input this is for and what path that address is!
          scriptType: 'p2pkh',
          amount: input.value.toString(),
          vout: input.index,
          txid: input.hash,
          hex: input.txHex,
        };
        //if segwit I need script
        if (input.witnessUtxo && isSegwit) {
          inputKeepKey.scriptType = 'p2wpkh';
        }
        inputsKeepKey.push(inputKeepKey);
      }
      inputs = inputsKeepKey;

      const txHex = await signTransaction(psbt, inputs, memo);
      console.log('txHex: ', txHex);
      return toolbox.broadcastTx(txHex);
    };

    return { ...utxoMethods, getAddress, signTransaction, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
