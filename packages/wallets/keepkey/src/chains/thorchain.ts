import type { KeepKeySdk } from "@keepkey/keepkey-sdk";
import type { AssetValue } from "@swapkit/helpers";
import { derivationPathToString } from "@swapkit/helpers";
import type { DepositParam, ThorchainToolboxType, TransferParams } from "@swapkit/toolbox-cosmos";
import type { DerivationPathArray } from "@swapkit/types";
import { Chain, ChainId, DerivationPath, RPCUrl } from "@swapkit/types";

import { bip32ToAddressNList } from "../helpers/coins.js";

type SignTransactionParams = {
  assetValue: AssetValue;
  recipient?: string;
  from: string;
  memo: string | undefined;
};

export const thorchainWalletMethods = async ({
  sdk,
  derivationPath,
}: {
  sdk: KeepKeySdk;
  derivationPath?: DerivationPathArray;
}): Promise<ThorchainToolboxType & { address: string }> => {
  const { createStargateClient, ThorchainToolbox } = await import("@swapkit/toolbox-cosmos");
  const toolbox = ThorchainToolbox({ stagenet: !"smeshnet" });
  const derivationPathString = derivationPath
    ? `m/${derivationPathToString(derivationPath)}`
    : DerivationPath.THOR;

  const { address: fromAddress } = (await sdk.address.thorchainGetAddress({
    address_n: bip32ToAddressNList(derivationPathString),
  })) as { address: string };

  const signTransaction = async ({ assetValue, recipient, from, memo }: SignTransactionParams) => {
    const { makeSignDoc, buildAminoMsg, getDefaultChainFee } = await import(
      "@swapkit/toolbox-cosmos"
    );

    const account = await toolbox.getAccount(from);
    if (!account) throw new Error("Account not found");
    if (!account.pubkey) throw new Error("Account pubkey not found");
    const { accountNumber, sequence = 0 } = account;

    const isTransfer = recipient && recipient !== "";

    const msg = buildAminoMsg({ from, recipient, assetValue, memo });

    const signDoc = makeSignDoc(
      [msg],
      getDefaultChainFee(Chain.THORChain),
      ChainId.THORChain,
      memo,
      accountNumber?.toString(),
      sequence,
    );

    const signedTx = isTransfer
      ? await sdk.thorchain.thorchainSignAminoTransfer({
          // TODO can we ignore this ?
          // @ts-expect-error readonly cant be assigned to writable
          signDoc,
          signerAddress: from,
        })
      : await sdk.thorchain.thorchainSignAminoDeposit({
          // @ts-expect-error
          signDoc,
          signerAddress: from,
        });
    const decodedBytes = atob(signedTx.serialized);
    return new Uint8Array(decodedBytes.length).map((_, i) => decodedBytes.charCodeAt(i));
  };

  const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
    try {
      const stargateClient = await createStargateClient(RPCUrl.THORChain);
      const signedTransaction = await signTransaction({
        assetValue,
        recipient,
        memo,
        from: fromAddress,
      });
      const { transactionHash } = await stargateClient.broadcastTx(signedTransaction);

      return transactionHash;
    } catch (e) {
      // TODO add correct error code
      console.error(e);
      throw e;
    }
  };

  const deposit = async ({ assetValue, memo }: DepositParam) => {
    try {
      const stargateClient = await createStargateClient(RPCUrl.THORChain);
      const signedTransaction = await signTransaction({
        assetValue,
        memo,
        from: fromAddress,
      });
      const { transactionHash } = await stargateClient.broadcastTx(signedTransaction);

      return transactionHash;
    } catch (e) {
      // TODO add correct error code
      console.error(e);
      throw e;
    }
  };

  return { ...toolbox, transfer, deposit, address: fromAddress };
};
