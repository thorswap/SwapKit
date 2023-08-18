// eslint-disable-next-line import/no-extraneous-dependencies
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AssetAtom, BinanceToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import { Chain, TxParams } from '@thorswap-lib/types';

export const binanceWalletMethods = async function (params: any) {
  try {
    let { sdk, stagenet } = params;
    if (!stagenet) stagenet = false;
    const toolbox = BinanceToolbox();
    console.log('toolbox: ', toolbox);

    const getAddress = async () =>
      (
        await sdk.address.cosmosGetAddress({
          address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
        })
      ).address;

    //TODO signTransaction
    const signTransactionTransfer = async function (params: any) {
      try {
        console.log('params: ', params);
        //TODO use toolbox to build this tx

        //Unsigned TX
        // let msg = {
        //   "addressNList":[
        //     2147483692,
        //     2147483766,
        //     2147483648,
        //     0,
        //     0
        //   ],
        //   "tx":{
        //     "msg":[
        //       {
        //         "inputs": [
        //           {
        //             "address": "bnb1afwh46v6nn30nkmugw5swdmsyjmlxslgjfugre",
        //             "coins": [
        //               {
        //                 "amount": 1000,
        //                 "denom": "BNB"
        //               }
        //             ]
        //           }
        //         ],
        //         "outputs": [
        //           {
        //             "address": "bnb1v7wds8atg9pxss86vq5qjuz38wqsadq7e5m2rr",
        //             "coins": [
        //               {
        //                 "amount": 1000,
        //                 "denom": "BNB"
        //               }
        //             ]
        //           }
        //         ]
        //       }
        //     ],
        //     "fee":{
        //       "gas":"0",
        //       "amount":[
        //         {
        //           "denom":"uatom",
        //           "amount":"1000"
        //         }
        //       ]
        //     },
        //     "signatures":[
        //
        //     ],
        //     "memo":"1234"
        //   },
        //   "sequence":"8",
        //   accountNumber:""
        // }
        //
        // let input = {
        //   signDoc: {
        //     "account_number": "471113",
        //     "chain_id": "Binance-Chain-Tigris",
        //     msgs: msg.tx.msg,
        //     memo: msg.tx.memo ?? '',
        //     "source": "0",
        //     sequence: msg.sequence,
        //     fee: {
        //       "amount": [
        //         {
        //           "amount": "2500",
        //           "denom": "uatom"
        //         }
        //       ],
        //       "gas": "250000"
        //     },
        //   },
        //   signerAddress: address,
        // }
        // console.log("input: ",input)
        // let responseSign = await sdk.bnb.bnbSignTransaction(input)
        // console.log("responseSign: ",responseSign)

        return '';
      } catch (e) {
        console.error(e);
      }
    };

    const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
      let from = await getAddress();
      return signTransactionTransfer({
        from: from,
        to: recipient,
        asset: getDenom(asset || AssetAtom),
        amount: amount.amount().toString(),
        memo,
      });
    };

    return {
      getAddress,
      transfer,
      ...toolbox,
    };
  } catch (e) {
    console.error(e);
  }
};
