import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { derivationPathToString } from '@swapkit/helpers';
import type { TransferParams } from '@swapkit/toolbox-cosmos';
import { DEFAULT_COSMOS_FEE_MAINNET, GaiaToolbox } from '@swapkit/toolbox-cosmos';
import { ChainId, DerivationPath, RPCUrl } from '@swapkit/types';

import { bip32ToAddressNList } from '../helpers/coins.ts';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const cosmosWalletMethods: any = async ({
  sdk,
  api,
  derivationPath,
}: {
  sdk: KeepKeySdk;
  api: string;
  derivationPath: any;
}) => {
  try {
    derivationPath = !derivationPath
      ? DerivationPath['GAIA']
      : `m/${derivationPathToString(derivationPath)}`;

    const { address: fromAddress } = (await sdk.address.cosmosGetAddress({
      address_n: bip32ToAddressNList(derivationPath),
    })) as { address: string };

    const toolbox = GaiaToolbox({ server: api });
    DEFAULT_COSMOS_FEE_MAINNET.amount[0].amount = String(
      (await toolbox?.getFeeRateFromThorswap?.(ChainId.Cosmos)) ?? '500',
    );

    // TODO support other cosmos assets
    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      try {
        const amount = assetValue.getBaseValue('string');
        const accountInfo = await toolbox.getAccount(fromAddress);

        const keepKeySignedTx = await sdk.cosmos.cosmosSignAmino({
          signerAddress: fromAddress,
          signDoc: {
            fee: DEFAULT_COSMOS_FEE_MAINNET,
            memo: memo || '',
            sequence: accountInfo?.sequence.toString() ?? '',
            chain_id: ChainId.Cosmos,
            account_number: accountInfo?.accountNumber.toString() ?? '',
            msgs: [
              {
                value: {
                  amount: [{ denom: 'uatom', amount }],
                  to_address: recipient,
                  from_address: fromAddress,
                },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
          },
        });

        const decodedBytes = atob(keepKeySignedTx.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length).map((_, i) =>
          decodedBytes.charCodeAt(i),
        );

        const client = await StargateClient.connect(RPCUrl.Cosmos);
        const response = await client.broadcastTx(uint8Array);

        return response.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
