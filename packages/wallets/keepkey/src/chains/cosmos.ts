// eslint-disable-next-line import/no-extraneous-dependencies
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AssetAtom, GaiaToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import { Chain, TxParams } from '@thorswap-lib/types';

export const cosmosWalletMethods = async function (params: any) {
  try {
    let { sdk, stagenet, api } = params;
    if (!stagenet) stagenet = false;
    const toolbox = GaiaToolbox({ server: api });
    console.log('toolbox: ', toolbox);

    const getAddress = async () =>
      (
        await sdk.address.cosmosGetAddress({
          address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
        })
      ).address;

    //TODO signTransaction
    let signTransactionTransfer = async function (params: any) {
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
        //
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
        //     // "accountNumber":"574492",
        //     // "chainId":"cosmoshub-4",
        //     "account_number":"95421",
        //     "chain_id":"cosmoshub-4",
        //     msgs: msg.tx.msg,
        //     memo: msg.tx.memo ?? '',
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
        // let responseSign = await sdk.cosmos.cosmosSignAmino(input)

        return '';
      } catch (e) {
        console.error(e);
      }
    };
    //TODO transfer
    const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
      let from = await getAddress();
      return toolbox.transfer({
        from,
        to: recipient,
        asset: getDenom(asset || AssetAtom),
        amount: amount.amount().toString(),
        memo,
      });
    };
    //TODO deposit

    return {
      getAddress,
      signTransactionTransfer,
      transfer,
      // getBalance,
      ...toolbox,
    };
  } catch (e) {
    console.error(e);
  }
};
