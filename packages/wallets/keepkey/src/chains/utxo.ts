// eslint-disable-next-line import/no-extraneous-dependencies
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
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

export const utxoWalletMethods = async function (params: any) {
  try {
    console.log('params: ', params);
    let { sdk, stagenet, chain, utxoApiKey, api, derivationPath } = params;
    if (!stagenet) stagenet = false;
    if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
    const coin = chain.toLowerCase() as 'btc' | 'bch' | 'ltc' | 'doge';
    console.log('coin: ', coin);

    const scriptType =
      derivationPath[0] === 84
        ? { input: 'SPENDWITNESS', output: 'PAYTOWITNESS' }
        : derivationPath[0] === 49
        ? { input: 'SPENDP2SHWITNESS', output: 'PAYTOP2SHWITNESS' }
        : derivationPath[0] === 44
        ? { input: 'SPENDADDRESS', output: 'PAYTOADDRESS' }
        : undefined;

    if (!scriptType) throw new Error('Derivation path is not supported');

    const toolbox =
      chain === Chain.Bitcoin
        ? BTCToolbox
        : chain === Chain.Litecoin
        ? LTCToolbox
        : chain === Chain.Dogecoin
        ? DOGEToolbox
        : BCHToolbox;

    const utxoMethods = toolbox(utxoApiKey || '', api);

    //getAddress
    const getAddress = async function (coin: string) {
      try {
        //TODO custom script types?
        let addressInfo = addressInfoForCoin(coin, false, 'p2wkh');
        let response = await sdk.address.utxoGetAddress(addressInfo);
        return response.address;
      } catch (e) {
        console.error(e);
      }
    };
    const address = await getAddress(coin);
    const signTransaction = async (psbt: Psbt, inputs: UTXO[], memo: string = '') => {
      const address_n = derivationPath.map((pathElement, index) =>
        index < 3 ? (pathElement | 0x80000000) >>> 0 : pathElement,
      );

      let outputs = psbt.txOutputs.map((output: any) => {
        const outputAddress =
          chain === Chain.BitcoinCash && output.address
            ? toCashAddress(output.address)
            : output.address;

        // Strip prefix from BCH address to compare with stripped address from Trezor
        const isChangeAddress =
          chain === Chain.BitcoinCash && outputAddress
            ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(outputAddress) === address
            : outputAddress === address;

        // OP_RETURN
        if (!output.address) {
          return {
            // @ts-ignore
            op_return_data: Buffer.from(memo).toString('hex'),
            amount: '0',
            script_type: 'PAYTOOPRETURN',
          };
        }

        // Change Address
        if (isChangeAddress) {
          return {
            address_n,
            amount: output.value,
            script_type: scriptType.output,
          };
        }

        // Outgoing UTXO
        return {
          address: outputAddress,
          amount: output.value,
          script_type: 'PAYTOADDRESS',
        };
      });

      let txToSign = {
        coin: 'Bitcoin',
        inputs,
        outputs,
        version: 1,
        locktime: 0,
      };
      console.log('txToSign: ', txToSign);
      let responseSign = await sdk.utxo.utxoSignTransaction(txToSign);

      return responseSign.serialized;
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

      console.log('feeRate: ', feeRate);

      let feeRates = await toolbox.getFeeRates();
      console.log('feeRates: ', feeRates);

      const { psbt, inputs } = await toolbox.buildTx({
        ...rest,
        memo,
        feeOptionKey,
        recipient,
        feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
        sender: from,
        fetchTxHex: chain === Chain.Dogecoin,
      });

      const txHex = await signTransaction(psbt, inputs, memo);
      console.log('txHex: ', txHex);
      return toolbox.broadcastTx(txHex);
    };

    return { ...utxoMethods, getAddress, signTransaction, transfer };
  } catch (e) {
    console.error(e);
  }
};
