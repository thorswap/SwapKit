import {
  type Chain,
  ChainToChainId,
  type DerivationPathArray,
  SwapKitNumber,
  derivationPathToString,
} from "@swapkit/helpers";
import type { JsonRpcProvider, Provider, TransactionRequest } from "@swapkit/toolbox-evm";

type TrezorEVMSignerParams = {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
};

export async function getEVMSigner({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
  const { AbstractSigner } = await import("@swapkit/toolbox-evm");

  class TrezorSigner extends AbstractSigner {
    address: string;
    chain: Chain;
    derivationPath: DerivationPathArray;
    readonly provider: Provider | JsonRpcProvider;

    constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
      super(provider);

      this.address = "";
      this.chain = chain;
      this.derivationPath = derivationPath;
      this.provider = provider;
    }

    getAddress = async () => {
      if (!this.address) {
        const { default: TrezorConnect } = await import("@trezor/connect-web");

        const result = await TrezorConnect.ethereumGetAddress({
          path: derivationPathToString(this.derivationPath),
          showOnTrezor: true,
        });

        if (!result.success) {
          throw new Error(result.payload.error);
        }

        this.address = result.payload.address;
      }

      return this.address;
    };

    signMessage = async (message: string) => {
      const { default: TrezorConnect } = await import("@trezor/connect-web");

      const result = await TrezorConnect.ethereumSignMessage({
        path: derivationPathToString(this.derivationPath),
        message,
      });

      if (!result.success) {
        throw new Error(result.payload.error);
      }

      return result.payload.signature;
    };

    // ANCHOR (@Towan): implement signTypedData
    signTypedData(): Promise<string> {
      throw new Error("this method is not implemented");
    }

    signTransaction = async ({
      to,
      gasLimit,
      value,
      data,
      nonce,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Todo: refactor
    }: TransactionRequest) => {
      if (!to) throw new Error("Missing to address");
      if (!gasLimit) throw new Error("Missing gasLimit");

      const isEIP1559 = maxFeePerGas && maxPriorityFeePerGas;

      if (isEIP1559 && !maxFeePerGas) {
        throw new Error("Missing maxFeePerGas");
      }
      if (isEIP1559 && !maxPriorityFeePerGas) {
        throw new Error("Missing maxFeePerGas");
      }
      if (!(isEIP1559 || gasPrice)) {
        throw new Error("Missing gasPrice");
      }

      const { default: TrezorConnect } = await import("@trezor/connect-web");
      const { Transaction, toHexString } = await import("@swapkit/toolbox-evm");

      const additionalFields = isEIP1559
        ? {
            maxFeePerGas: toHexString(BigInt(maxFeePerGas?.toString() || 0)),
            maxPriorityFeePerGas: toHexString(BigInt(maxPriorityFeePerGas?.toString() || 0)),
          }
        : (gasPrice && { gasPrice: toHexString(BigInt(gasPrice?.toString() || 0)) }) || {
            gasPrice: "0x0",
          };

      const formattedTx = {
        chainId: Number.parseInt(ChainToChainId[this.chain]),
        to: to.toString(),
        value: toHexString(BigInt(value?.toString() || 0)),
        gasLimit: toHexString(BigInt(gasLimit?.toString() || 0)),
        nonce: (
          nonce?.toString() ||
          (await this.provider.getTransactionCount(await this.getAddress(), "pending"))
        ).toString(),
        data: data?.toString() || "0x",
        ...additionalFields,
      };

      const { success, payload } = await TrezorConnect.ethereumSignTransaction({
        path: derivationPathToString(this.derivationPath),
        transaction: formattedTx,
      });

      if (!success) {
        throw new Error(payload.error);
      }

      const { r, s, v } = payload;

      const hash = Transaction.from({
        ...formattedTx,
        nonce: Number.parseInt(formattedTx.nonce),
        type: isEIP1559 ? 2 : 0,
        signature: { r, s, v: new SwapKitNumber(v).getBaseValue("number") },
      }).serialized;

      if (!hash) {
        throw new Error("Failed to sign transaction");
      }

      return hash;
    };

    connect = (provider: Provider | null) => {
      if (!provider) throw new Error("Missing provider");

      return new TrezorSigner({
        chain: this.chain,
        derivationPath: this.derivationPath,
        provider,
      });
    };
  }

  return new TrezorSigner({ chain, derivationPath, provider });
}
