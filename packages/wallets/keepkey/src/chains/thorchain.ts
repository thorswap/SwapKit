// eslint-disable-next-line import/no-extraneous-dependencies
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AssetRuneNative,
  DepositParam,
  getDenom,
  ThorchainToolbox,
} from '@thorswap-lib/toolbox-cosmos';
import { Chain, WalletTxParams } from '@thorswap-lib/types';

export const thorchainWalletMethods = async function (params: any) {
  try {
    let { sdk, stagenet } = params;
    if (!stagenet) stagenet = false;
    const toolbox = ThorchainToolbox({ stagenet });
    console.log('toolbox: ', toolbox);

    const getAddress = async () =>
      (
        await sdk.address.thorchainGetAddress({
          address_n: addressInfoForCoin(Chain.THORChain, false).address_n,
        })
      ).address;

    //TODO signTransaction
    let signTransactionDeposit = async (params: any) => {
      try {
        console.log('params: ', params);
        //TODO use toolbox to build this tx

        // let msg = {
        //   "addressNList": [
        //     2147483692,
        //     2147484579,
        //     2147483648,
        //     0,
        //     0
        //   ],
        //   "tx": {
        //     "fee": {
        //       "amount": [
        //         {
        //           "amount": "0",
        //           "denom": "rune"
        //         }
        //       ],
        //       "gas": "500000000"
        //     },
        //     "msg": [
        //       {
        //         "type": "thorchain/MsgDeposit",
        //         "value": {
        //           "coins": [
        //             {
        //               "asset": "THOR.RUNE",
        //               "amount": "70000000000"
        //             }
        //           ],
        //           "memo": "s:ETH.FOX-52D:0x27de622cc44c55b53caF299eCedccdAB29aC98A8:2937014586539:ss:30",
        //           "signer": "thor1qnxqpu6a6m5wwsh4k2rt74xfunz259caqyqw27"
        //         }
        //       }
        //     ],
        //     "signatures": [],
        //     "memo": "s:ETH.FOX-52D:0x27de622cc44c55b53caF299eCedccdAB29aC98A8:2937014586539:ss:30"
        //   },
        //   "chain_id": "thorchain-mainnet-v1",
        //   "account_number": "70145",
        //   "sequence": "0"
        // }
        // console.log("msg.tx.msgs: ",msg.tx.msg)
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
        // let responseSign = await sdk.thorchain.thorchainSignAminoDeposit(input)
        // return responseSign.signDoc

        return '';
      } catch (e) {
        console.error(e);
      }
    };

    //TODO signDesposit
    let signTransactionTransfer = async (params: any) => {
      try {
        console.log('params: ', params);
        let { amount, to, from, memo } = params;
        let addressInfo = addressInfoForCoin(Chain.THORChain, false, 'p2wkh');
        console.log('amount: ', amount);
        console.log('to: ', to);
        console.log('addressInfo: ', addressInfo);
        console.log('toolbox: ', toolbox);
        console.log('toolbox: ', toolbox.sdk);

        let accountInfo = await toolbox.getAccount(from);
        console.log('accountInfo: ', accountInfo);

        //TODO
        //this is placeholder
        let msg = {
          addressNList: addressInfo.address_n,
          tx: {
            msgs: [
              {
                type: 'thorchain/MsgSend',
                value: {
                  amount: {
                    amount: amount.toString(),
                    denom: 'urune',
                  },
                  from_address: from,
                  to_address: to,
                },
              },
            ],
            fee: {
              gas: '0',
              amount: [
                {
                  denom: 'urune',
                  amount: '1000',
                },
              ],
            },
            signatures: [],
            memo,
          },
          sequence: accountInfo.sequence.toString(),
          accountNumber: accountInfo.accountNumber.toString(),
        };
        console.log('msg.tx.msgs: ', msg.tx.msgs);
        let input = {
          signDoc: {
            account_number: accountInfo.accountNumber.toString(),
            chain_id: 'thorchain',
            msgs: msg.tx.msgs,
            memo: msg.tx.memo ?? '',
            sequence: accountInfo.sequence.toString(),
            fee: {
              amount: [
                {
                  amount: '2500',
                  denom: 'uatom',
                },
              ],
              gas: '250000',
            },
          },
          signerAddress: from,
        };
        console.log('input import: ', input);
        let responseSign = await sdk.thorchain.thorchainSignAminoTransfer({
          addressNList: addressInfo.address_n,
          chain_id: 'thorchain',
          account_number: accountInfo.accountNumber.toString(),
          sequence: accountInfo.sequence.toString(),
          tx: input.signDoc,
        });
        console.log('responseSign: ', responseSign);
        return responseSign.signDoc;

        // return '';
      } catch (e) {
        console.error(e);
      }
    };

    const transfer = async ({
      asset = AssetRuneNative,
      amount,
      recipient,
      memo,
    }: WalletTxParams) => {
      let fromAddress = await getAddress();
      return signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: getDenom(asset || AssetRuneNative),
        amount: amount.amount().toString(),
        memo,
      });
    };

    const deposit = async ({ asset = AssetRuneNative, amount, memo }: DepositParam) => {
      let fromAddress = await getAddress();
      return signTransactionDeposit({ asset, amount, memo, from: fromAddress });
    };

    return {
      ...toolbox,
      getAddress,
      transfer,
      deposit,
    };
  } catch (e) {
    console.error(e);
  }
};
