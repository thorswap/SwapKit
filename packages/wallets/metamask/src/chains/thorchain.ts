// @ts-ignore
import { StargateClient } from '@cosmjs/stargate';
// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { DepositParam, ThorchainToolbox, TransferParams } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, RPCUrl } from '@coinmasters/types';

// @ts-ignore
import type { MetaMaskParams } from '../metamask.ts';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

// @ts-ignore
export const thorChainWalletMethods: any = async function (params: MetaMaskParams) {
  try {
    const { wallet } = params;
    const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });

    const getAddress = async () =>
      (
        await wallet.thorchainGetAddress({
        addressNList: addressInfoForCoin(Chain.THORChain, false).address_n,
        })
      );

    const signTransactionTransfer = async (params: SignTransactionTransferParams) => {
      try {
        const { amount, asset, to, from, memo } = params;
        const addressInfo = addressInfoForCoin(Chain.THORChain, false); // @highlander no witness script here
        const accountInfo = await toolbox.getAccount(from);

        let body = {
          addressNList: addressInfoForCoin(Chain.THORChain, false).address_n,
          sequence: accountInfo?.sequence.toString() ?? '0',
          source: addressInfo?.source?.toString() ?? '0',
          account_number: accountInfo?.accountNumber?.toString() ?? '0',
          chain_id: ChainId.THORChain,
          "tx": {
            "fee": {
              "amount": [
                {
                  "amount": "0",
                  "denom": "rune"
                }
              ],
              "gas": "500000000"
            },
            "memo": memo,
            "msg": [
              {
                type: 'thorchain/MsgSend',
                value: {
                  amount: [
                    {
                      denom: asset.toLowerCase(),
                      amount: amount.toString(),
                    },
                  ],
                  to_address: to,
                  from_address: from,
                },
              }
            ],
            "signatures": [
            ]
          }
        }
        const [metaMaskResponse, stargateClient] = await Promise.all([
          wallet.thorchainSignTx(body),
          StargateClient.connect(RPCUrl.THORChain),
        ]);

        const decodedBytes = atob(metaMaskResponse.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length);
        for (let i = 0; i < decodedBytes.length; i++) {
          uint8Array[i] = decodedBytes.charCodeAt(i);
        }

        const broadcastResponse = await stargateClient.broadcastTx(uint8Array);

        return broadcastResponse.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
      signTransactionTransfer({
        from: await getAddress(),
        to: recipient,
        asset: assetValue?.symbol,
        amount: assetValue.baseValue.toString(),
        memo,
      });


    const signTransactionDeposit = async ({
                                            amount,
                                            asset,
                                            memo = '',
                                          }: SignTransactionDepositParams) => {
      try {
        let fromAddress = await getAddress();
        const addressInfo = addressInfoForCoin(Chain.THORChain, false); // @highlander no witness script here
        const accountInfo = await toolbox.getAccount(fromAddress);

        let requestToSign = {
          addressNList: addressInfoForCoin(Chain.THORChain, false).address_n,
          sequence: accountInfo?.sequence.toString() ?? '0',
          source: addressInfo?.source?.toString() ?? '0',
          account_number: accountInfo?.accountNumber?.toString() ?? '0',
          chain_id: ChainId.THORChain,
          "tx": {
            "fee": {
              "amount": [
                {
                  "amount": "0",
                  "denom": "rune"
                }
              ],
              "gas": "500000000"
            },
            "memo": memo,
            "msg": [
              {
                "type": "thorchain/MsgDeposit",
                "value": {
                  "coins": [{ asset: 'THOR.' + asset.toUpperCase(), amount: amount.toString() }],
                  "memo": memo,
                  "signer": fromAddress
                }
              }
            ],
            "signatures": [
            ]
          }
        }
        console.log("requestToSign: ",requestToSign)
        const signedResponse = await wallet.thorchainSignTx(requestToSign);
        console.log("signedResponse: ",signedResponse)

        const stargateClient = await StargateClient.connect(RPCUrl.THORChain);
        const decodedBytes = atob(signedResponse.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length);
        for (let i = 0; i < decodedBytes.length; i++) {
          uint8Array[i] = decodedBytes.charCodeAt(i);
        }
        const broadcastResponse = await stargateClient.broadcastTx(uint8Array);

        return broadcastResponse.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const deposit = async ({ assetValue, memo }: DepositParam) =>
      signTransactionDeposit({
        memo,
        asset: assetValue.symbol,
        amount: assetValue.baseValue.toString(),
        from: await getAddress(),
      });

    return {
      ...toolbox,
      getAddress,
      transfer,
      deposit
    };
  } catch (e) {
    console.error(e);
  }
};
