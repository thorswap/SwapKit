import { BigNumber } from '@ethersproject/bignumber';
import { addressInfoForCoin, COIN_MAP_KEEPKEY_LONG } from '@pioneer-platform/pioneer-coins';
import {
  BCHToolbox,
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOTransferParams,
} from '@thorswap-lib/toolbox-utxo';
import {
  Chain,
  // WalletOption,
  // ConnectWalletParams,
  // DerivationPathArray,
  FeeOption,
  UTXO,
} from '@thorswap-lib/types';
import { toCashAddress } from 'bchaddrjs';
import { Psbt } from 'bitcoinjs-lib';

let normalizeAddressNlist = function(derivationPath: any){
  let addressNlist = [
    0x80000000 + derivationPath[0],
    0x80000000 + derivationPath[1],
    0x80000000 + derivationPath[2],
    derivationPath[3],
    derivationPath[4],
  ];
  return addressNlist
}

export const utxoWalletMethods = async function (params: any) {
  try {
    let { sdk, stagenet, chain, utxoApiKey, api, derivationPath } = params;
    if (!stagenet) stagenet = false;
    if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
    let toolbox;
    let isSegwit: boolean = false;

    switch (chain) {
      case Chain.Bitcoin:
        isSegwit = true;
        toolbox = BTCToolbox(utxoApiKey, api);
        break;
      case Chain.Litecoin:
        isSegwit = true;
        toolbox = LTCToolbox(utxoApiKey, api);
        break;
      case Chain.Dogecoin:
        toolbox = DOGEToolbox(utxoApiKey, api);
        break;
      case Chain.BitcoinCash:
        toolbox = BCHToolbox(utxoApiKey, api);
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
          scriptType = 'p2sh';
        }
        let addressInfo = addressInfoForCoin(chain, false, scriptType);
        let addressNlist = normalizeAddressNlist(derivationPath);
        addressInfo.address_n = addressNlist;
        let response = await sdk.address.utxoGetAddress(addressInfo);
        return response.address;
      } catch (e) {
        console.error(e);
      }
    };
    const address = await getAddress();

    const signTransaction = async (psbt: Psbt, inputs: UTXO[], memo: string = '', amount: any) => {
      const address_n = derivationPath.map((pathElement, index) =>
        index < 3 ? (pathElement | 0x80000000) >>> 0 : pathElement,
      );
      let outputs: any = psbt.txOutputs.map((output: any) => {
        let outputAddress = output.address;

        if (chain === Chain.BitcoinCash && output.address) {
          outputAddress = toCashAddress(output.address);
        }

        let isChangeAddress = false;

        if (chain === Chain.BitcoinCash && outputAddress) {
          const strippedAddress = (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(
            outputAddress,
          );
          isChangeAddress = strippedAddress === address;
        } else {
          isChangeAddress = outputAddress === address;
        }
        if (!output.address) {
          return {
            op_return_data: Buffer.from(memo).toString('hex'),
            amount: '0',
            script_type: 'PAYTOOPRETURN',
          };
        }

        if (isChangeAddress) {
          return {
            address_n,
            addressNList: address_n,
            isChange: true,
            addressType: 'spend',
            amount: output.value,
            script_type: scriptType.output,
          };
        }

        return {
          address: outputAddress,
          amount: BigNumber.from(amount || 0),
          addressType: 'spend',
          script_type: 'PAYTOADDRESS',
        };
      });
      let outputsKeepKey = [];
      for (const output of outputs) {
        const outputKeepKey: any = {
          scriptType: 'p2pkh',
          addressType: output.addressType,
          amount: output.amount.toString(),
        };
        if (output.address) outputKeepKey.address = output.address;
        if (output.isChange) {
          outputKeepKey.isChange = true;
          outputKeepKey.addressNList = output.address_n;
        }
        outputsKeepKey.push(outputKeepKey);
      }
      outputs = outputsKeepKey;

      let txToSign = {
        coin: COIN_MAP_KEEPKEY_LONG[chain],
        inputs,
        outputs,
        version: 1,
        locktime: 0,
      };
      let responseSign = await sdk.utxo.utxoSignTransaction(txToSign);
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
      let { psbt, inputs } = await toolbox.buildTx({
        ...rest,
        memo,
        feeOptionKey,
        recipient,
        feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
        sender: from,
        fetchTxHex: chain,
      });

      //convert inputs for keepkey
      let inputsKeepKey = [];
      for (const input of inputs) {
        const inputKeepKey = {
          scriptType: 'p2pkh',
          amount: input.value.toString(),
          vout: input.index,
          txid: input.hash,
          hex: input.txHex,
        };
        //if segwit I need script
        if (input.witnessUtxo && isSegwit) {
          inputKeepKey.scriptType = 'p2sh';
          //add script sig
          const scriptHex = input.witnessUtxo.script
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');

          // Construct the scriptSig object
          const scriptSig = {
            asm: `${scriptHex.length / 2} ${scriptHex}`,
            hex: scriptHex,
          };
          inputKeepKey.scriptSig = scriptSig;
        }
        inputsKeepKey.push(inputKeepKey);
      }
      inputs = inputsKeepKey;

      const txHex = await signTransaction(psbt, inputs, memo, amount);
      return toolbox.broadcastTx(txHex);
    };

    return { ...utxoMethods, getAddress, signTransaction, transfer };
  } catch (e) {
    console.error(e);
  }
};
