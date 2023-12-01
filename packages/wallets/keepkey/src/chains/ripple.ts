import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { RippleToolbox } from '@coinmasters/toolbox-ripple';
import { Chain, ChainId, RPCUrl } from '@coinmasters/types';
import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { addressInfoForCoin } from '../coins.ts';

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
      address_n: addressInfoForCoin(Chain.Ripple, false).address_n,
    })) as { address: string };

    const toolbox = RippleToolbox();

    // const signTransactionTransfer = async ({
    //                                          amount,
    //                                          to,
    //                                          from,
    //                                          memo = '',
    //                                        }: SignTransactionTransferParams) => {
    //   try {
    //     const accountInfo = await toolbox.getAccount(fromAddress);
    //
    //     let fromAddress = from
    //     let desttag = memo
    //     if(!desttag) desttag = "0"
    //     let tx = {
    //       "type": "auth/StdTx",
    //       "value": {
    //         "fee": {
    //           "amount": [
    //             {
    //               "amount": "1000",
    //               "denom": "drop"
    //             }
    //           ],
    //           "gas": "28000"
    //         },
    //         "memo": "KeepKey",
    //         "msg": [
    //           {
    //             "type": "ripple-sdk/MsgSend",
    //             "DestinationTag":desttag,
    //             "value": {
    //               "amount": [
    //                 {
    //                   "amount": parseFloat(amount) * 1000000,
    //                   "denom": "drop"
    //                 }
    //               ],
    //               "from_address": fromAddress,
    //               "to_address": to
    //             }
    //           }
    //         ],
    //         "signatures": null
    //       }
    //     }
    //
    //     //Unsigned TX
    //     let unsignedTx = {
    //       "HDwalletPayload": {
    //         addressNList: [ 2147483692, 2147483792, 2147483648, 0, 0 ],
    //         tx:tx,
    //         flags: undefined,
    //         sequence,
    //         lastLedgerSequence: parseInt(ledgerIndexCurrent + 1000000000).toString(),
    //         payment: {
    //           amount: parseInt(amount * 1000000).toString(),
    //           destination: to,
    //           destinationTag: desttag,
    //         },
    //       },
    //       "verbal": "Ripple transaction"
    //     }
    //     //push tx to api
    //     console.log("unsignedTx: ", JSON.stringify(unsignedTx.HDwalletPayload))
    //     let responseSign = await sdk.xrp.xrpSignTransaction(unsignedTx.HDwalletPayload)
    //     console.log("responseSign: ", responseSign)
    //
    //     //broadcast TODO
    //
    //     return response.transactionHash;
    //   } catch (e) {
    //     console.error(e);
    //     throw e;
    //   }
    // };
    //
    // const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
    //   signTransactionTransfer({
    //     from: fromAddress,
    //     to: recipient,
    //     asset: 'xrp',
    //     amount: assetValue.baseValue.toString(),
    //     memo,
    //   });

    return { ...toolbox, getAddress: () => fromAddress };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
