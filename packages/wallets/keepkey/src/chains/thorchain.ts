import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
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

        console.log('params: ', params);
        let { amount, from, memo } = params;
        let addressInfo = addressInfoForCoin(Chain.THORChain, false, 'p2wkh');
        let accountInfo = await toolbox.getAccount(from);
        console.log('accountInfo: ', accountInfo);

        let msg = {
          addressNList: addressInfo.address_n,
          tx: {
            msgs: [
              {
                type: 'thorchain/MsgDeposit',
                value: {
                  amount: {
                    amount: amount.toString(),
                    asset: 'THOR.RUNE',
                  },
                  signer: from,
                  memo,
                },
              },
            ],
            fee: {
              gas: '0',
              amount: [
                {
                  denom: 'rune',
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
                  denom: 'rune',
                },
              ],
              gas: '250000',
            },
          },
          signerAddress: from,
        };
        console.log('input import: ', input);
        let responseSign = await sdk.thorchain.thorchainSignAminoDeposit({
          addressNList: addressInfo.address_n,
          chain_id: 'thorchain',
          account_number: accountInfo.accountNumber.toString(),
          sequence: accountInfo.sequence.toString(),
          tx: input.signDoc,
        });
        console.log('responseSign: ', responseSign);
        return responseSign.signDoc;
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
        let accountInfo = await toolbox.getAccount(from);
        console.log('accountInfo: ', accountInfo);

        let msg = {
          addressNList: addressInfo.address_n,
          tx: {
            msgs: [
              {
                type: 'thorchain/MsgSend',
                value: {
                  amount: {
                    amount: amount.toString(),
                    denom: 'rune',
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
                  denom: 'rune',
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
