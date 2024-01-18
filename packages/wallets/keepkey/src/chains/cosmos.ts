import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { derivationPathToString } from '@swapkit/helpers';
import type { BaseCosmosToolboxType, TransferParams } from '@swapkit/toolbox-cosmos';
import type { DerivationPathArray } from '@swapkit/types';
import { ChainId, DerivationPath, RPCUrl } from '@swapkit/types';

import { bip32ToAddressNList } from '../helpers/coins.ts';

export const cosmosWalletMethods = async ({
  sdk,
  api,
  derivationPath,
}: {
  sdk: KeepKeySdk;
  api: string;
  derivationPath?: DerivationPathArray;
}): Promise<BaseCosmosToolboxType & { getAddress: () => string }> => {
  const { DEFAULT_COSMOS_FEE_MAINNET, GaiaToolbox, createStargateClient } = await import(
    '@swapkit/toolbox-cosmos'
  );

  try {
    const derivationPathString = derivationPath
      ? `m/${derivationPathToString(derivationPath)}`
      : DerivationPath.GAIA;

    const { address: fromAddress } = (await sdk.address.cosmosGetAddress({
      address_n: bip32ToAddressNList(derivationPathString),
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

        const client = await createStargateClient(RPCUrl.Cosmos);
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
