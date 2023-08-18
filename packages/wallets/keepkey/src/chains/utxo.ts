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
import { BigNumber } from '@ethersproject/bignumber';

export const utxoWalletMethods = async function (params: any) {
  try {
    console.log('params: ', params);
    let { sdk, stagenet, chain, utxoApiKey, api, derivationPath } = params;
    if (!stagenet) stagenet = false;
    if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
    console.log('derivationPath: ', derivationPath);
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

    if (!scriptType) throw new Error('Derivation path is not supported');
    console.log('chain: ', chain);

    console.log('utxoApiKey: ', utxoApiKey);
    console.log('api: ', api);
    const utxoMethods = toolbox;

    //getAddress
    const getAddress = async function () {
      try {
        //TODO custom script types?
        let scriptType;
        if (isSegwit) {
          scriptType = 'p2sh';
        } else {
          scriptType = 'p2wkh';
        }
        let addressInfo = addressInfoForCoin(chain, false, scriptType);
        console.log('addressInfo: ', addressInfo);
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

      console.log('address_n: ', address_n);
      let outputs: any = psbt.txOutputs.map((output: any) => {
        console.log('output: ', output);
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

        console.log('isChangeAddress: ', isChangeAddress);
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
          amount: BigNumber.from(value || 0),
          addressType: 'spend',
          script_type: 'PAYTOADDRESS',
        };
      });
      console.log('outputs: PRE: ', outputs);
      let outputsKeepKey = [];
      for (const output of outputs) {
        console.log('output: PRE: ', output);
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
      console.log('txToSign: ', txToSign);
      let responseSign = await sdk.utxo.utxoSignTransaction(txToSign);
      console.log('responseSign: ', responseSign);
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
      console.log('transfer params: ', {
        from,
        recipient,
        feeOptionKey,
        feeRate,
        memo,
        ...rest,
      });
      if (!amount) throw new Error('Amount must be provided');
      if (!from) throw new Error('From address must be provided');
      if (!recipient) throw new Error('Recipient address must be provided');
      console.log('params: ', {
        from,
        recipient,
        feeOptionKey,
        feeRate,
        memo,
        ...rest,
      });
      console.log('feeRate: ', feeRate);
      console.log('toolbox: ', toolbox);

      let feeRates = await toolbox.getFeeRates();
      console.log('feeRates: ', feeRates);

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
        console.log('PRE: input: ', input);
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
          console.log(input.witnessUtxo);
          console.log(input.witnessUtxo.script);
          console.log(input.witnessUtxo.script);
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
      console.log('txHex: ', txHex);
      return toolbox.broadcastTx(txHex);
    };

    return { ...utxoMethods, getAddress, signTransaction, transfer };
  } catch (e) {
    console.error(e);
  }
};
