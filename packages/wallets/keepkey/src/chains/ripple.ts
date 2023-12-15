import { RippleToolbox } from '@coinmasters/toolbox-ripple';
import { Chain, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { bip32ToAddressNList } from '../helpers/coins.ts';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const rippleWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  try {
    const { address: fromAddress } = (await sdk.address.xrpGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.Ripple]),
    })) as { address: string };

    const toolbox = RippleToolbox();

    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(from);
        const sequence = accountInfo.Sequence.toString();
        const ledgerIndexCurrent = accountInfo.ledger_index_current;
        let fromAddress = from;
        let desttag = memo;
        if (!desttag) desttag = '0';
        let tx = {
          type: 'auth/StdTx',
          value: {
            fee: {
              amount: [
                {
                  amount: '1000',
                  denom: 'drop',
                },
              ],
              gas: '28000',
            },
            memo: 'KeepKey',
            msg: [
              {
                type: 'ripple-sdk/MsgSend',
                DestinationTag: desttag,
                value: {
                  amount: [
                    {
                      amount: amount,
                      denom: 'drop',
                    },
                  ],
                  from_address: fromAddress,
                  to_address: to,
                },
              },
            ],
            signatures: null,
          },
        };

        //Unsigned TX
        let unsignedTx = {
          addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
          tx: tx,
          flags: undefined,
          lastLedgerSequence: parseInt(ledgerIndexCurrent + 1000000000).toString(),
          sequence: sequence || '0',
          payment: {
            amount,
            destination: to,
            destinationTag: desttag,
          },
        };
        //push tx to api
        console.log('unsignedTx: ', JSON.stringify(unsignedTx));
        let responseSign = await sdk.xrp.xrpSignTransaction(unsignedTx);
        console.log('responseSign: ', responseSign);

        //broadcast TODO

        return responseSign.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = ({ assetValue, recipient, memo }: any) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: 'xrp',
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    return { ...toolbox, transfer, getAddress: () => fromAddress };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
