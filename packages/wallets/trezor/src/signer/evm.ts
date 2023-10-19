import { derivationPathToString, SwapKitNumber } from '@swapkit/helpers';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import TrezorConnect from '@trezor/connect-web';
import {
  AbstractSigner,
  type JsonRpcProvider,
  type Provider,
  type TransactionRequest,
} from 'ethers';

interface TrezorEVMSignerParams {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class TrezorSigner extends AbstractSigner {
  address: string;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
    super(provider);
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.provider = provider;
    this.address = '';
  }

  getAddress = async () => {
    if (!this.address) {
      const result = await (
        TrezorConnect as unknown as TrezorConnect.TrezorConnect
      ).ethereumGetAddress({
        path: `m/${derivationPathToString(this.derivationPath)}`,
        showOnTrezor: true,
      });

      if (!result.success) throw new Error(result.payload.error);
      this.address = result.payload.address;
    }

    return this.address;
  };

  signMessage = async (message: string) => {
    const result = await (
      TrezorConnect as unknown as TrezorConnect.TrezorConnect
    ).ethereumSignMessage({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      message,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.signature;
  };

  // ANCHOR (@Towan): implement signTypedData
  signTypedData(): Promise<string> {
    throw new Error('this method is not implemented');
  }

  signTransaction = async ({
    to,
    gasLimit,
    from,
    value,
    data,
    nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
  }: TransactionRequest) => {
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');

    const isEIP1559 = maxFeePerGas && maxPriorityFeePerGas;

    if (isEIP1559 && !maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!isEIP1559 && !gasPrice) throw new Error('Missing gasPrice');

    const { toHexString } = await import('@swapkit/toolbox-evm');

    const formattedTx = {
      from: from?.toString() || (await this.getAddress()),
      chainId: parseInt(ChainToChainId[this.chain], 16),
      to: to.toString(),
      value: toHexString(BigInt(value?.toString() || 0)),
      gasLimit: toHexString(BigInt(gasLimit?.toString() || 0)),
      nonce: (
        nonce?.toString() ||
        (await this.provider.getTransactionCount(await this.getAddress(), 'pending'))
      ).toString(),
      data: data?.toString() || '0x',
      ...(isEIP1559
        ? {
            maxFeePerGas: toHexString(BigInt(maxFeePerGas?.toString() || 0)),
            maxPriorityFeePerGas: toHexString(BigInt(maxPriorityFeePerGas?.toString() || 0)),
          }
        : (gasPrice && { gasPrice: toHexString(BigInt(gasPrice?.toString() || 0)) }) || {
            gasPrice: '0x0',
          }),
    };

    const result = await (
      TrezorConnect as unknown as TrezorConnect.TrezorConnect
    ).ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: formattedTx,
    });

    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const { Transaction } = await import('ethers');
    const hash = Transaction.from({
      ...formattedTx,
      nonce: parseInt(formattedTx.nonce),
      type: isEIP1559 ? 2 : 0,
      signature: { r, s, v: new SwapKitNumber(v).baseValueNumber },
    }).serialized;

    if (!hash) throw new Error('Failed to sign transaction');

    return hash;
  };

  sendTransaction = async (tx: TransactionRequest) => {
    if (!this.provider) throw new Error('No provider set');

    const signedTxHex = await this.signTransaction(tx);

    return await this.provider.broadcastTransaction(signedTxHex);
  };

  connect = (provider: Provider | null) => {
    if (!provider) throw new Error('Missing provider');

    return new TrezorSigner({
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
  };
}
export const getEVMSigner = async ({ chain, derivationPath, provider }: TrezorEVMSignerParams) =>
  new TrezorSigner({ chain, derivationPath, provider });
