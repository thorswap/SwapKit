import type { Psbt } from "@swapkit/toolbox-utxo";
import {
  AddressPurpose,
  BitcoinNetworkType,
  type GetAddressResponse,
  signTransaction as SatsConnectSignTransaction,
  type SignTransactionResponse,
  getAddress,
} from "sats-connect";

export async function getSatsConnectSignAndAddress() {
  const { Psbt } = await import("@swapkit/toolbox-utxo");

  let address: string | undefined;

  const getAddressOptions = {
    payload: {
      purposes: [AddressPurpose.Payment],
      message: "Address for receiving payments",
      network: {
        type: BitcoinNetworkType.Mainnet,
      },
    },
    onFinish: (response: GetAddressResponse) => {
      address = response.addresses[0]?.address;
    },
    onCancel: () => {
      throw new Error("Get address request failed");
    },
  };

  await getAddress(getAddressOptions);

  if (!address) throw new Error("No address found");

  const signTransaction = async (psbt: Psbt) => {
    let signedTransaction: string | undefined;
    const signPsbtOptions = {
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
        psbtBase64: psbt.toBase64(),
        broadcast: false,
        inputsToSign: psbt.txInputs.map((input) => ({
          address: address as string,
          signingIndexes: [input.index],
        })),
        message: "Sign transaction",
      },
      onFinish: (response: SignTransactionResponse) => {
        signedTransaction = response.psbtBase64;
      },
      onCancel: () => {
        throw new Error("Sign transaction request failed");
      },
    };

    await SatsConnectSignTransaction(signPsbtOptions);

    if (!signedTransaction) throw new Error("Could not sign transaction");
    return Psbt.fromBase64(signedTransaction);
  };

  return { signTransaction, address };
}
