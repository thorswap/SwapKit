import type { KeepKeySdk } from "@keepkey/keepkey-sdk";
import {
  type AssetValue,
  Chain,
  ChainId,
  DerivationPath,
  type DerivationPathArray,
  type WalletTxParams,
  derivationPathToString,
} from "@swapkit/helpers";
import type { BinanceToolboxType } from "@swapkit/toolbox-cosmos";

import { bip32ToAddressNList } from "../helpers/coins.ts";

export const binanceWalletMethods = async ({
  sdk,
  derivationPath,
}: {
  sdk: KeepKeySdk;
  derivationPath?: DerivationPathArray;
}): Promise<BinanceToolboxType & { address: string }> => {
  try {
    const { BinanceToolbox } = await import("@swapkit/toolbox-cosmos");
    const toolbox = BinanceToolbox();

    const derivationPathString = derivationPath
      ? derivationPathToString(derivationPath)
      : `${DerivationPath.BNB}/0`;

    const { address: fromAddress } = (await sdk.address.binanceGetAddress({
      address_n: bip32ToAddressNList(derivationPathString),
    })) as { address: string };

    const transfer = async ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) => {
      const accountInfo = await toolbox.getAccount(fromAddress);
      const amount = assetValue.getBaseValue("string");
      const keepKeyResponse = await sdk.bnb.bnbSignTransaction({
        signerAddress: fromAddress,
        signDoc: {
          account_number: accountInfo?.account_number.toString() ?? "0",
          chain_id: ChainId.Binance,
          memo: memo || "",
          sequence: accountInfo?.sequence.toString() ?? "0",
          source: "0",
          msgs: [
            {
              outputs: [{ address: recipient, coins: [{ denom: Chain.Binance, amount }] }],
              inputs: [{ address: fromAddress, coins: [{ denom: Chain.Binance, amount }] }],
            },
          ],
        },
      });

      const broadcastResponse = await toolbox.sendRawTransaction(keepKeyResponse?.serialized, true);
      return broadcastResponse?.result?.hash;
    };

    return { ...toolbox, transfer, address: fromAddress };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
