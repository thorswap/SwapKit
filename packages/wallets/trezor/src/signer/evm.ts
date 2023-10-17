import { derivationPathToString, SwapKitNumber } from '@swapkit/helpers';
import type { EVMTxParams } from '@swapkit/toolbox-evm';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import TrezorConnect from '@trezor/connect-web';
import { AbstractSigner, type JsonRpcProvider, type Provider } from 'ethers';

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

  signTransaction = async ({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) => {
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');

    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;

    if (isEIP1559 && !restTx.maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !restTx.maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!isEIP1559 && (('gasPrice' in restTx && !restTx.gasPrice) || !('gasPrice' in restTx)))
      throw new Error('Missing gasPrice');

    const { toHexString } = await import('@swapkit/toolbox-evm');

    const baseTx = {
      from: from || (await this.getAddress()),
      chainId: parseInt(ChainToChainId[this.chain], 16),
      to,
      value: toHexString(value || 0n),
      gasLimit: toHexString(gasLimit),
      nonce: (
        nonce || (await this.provider.getTransactionCount(await this.getAddress(), 'pending'))
      ).toString(),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: toHexString(restTx.maxFeePerGas),
            maxPriorityFeePerGas: toHexString(restTx.maxPriorityFeePerGas),
          }
        : ('gasPrice' in restTx && { gasPrice: toHexString(restTx.gasPrice) }) || {
            gasPrice: '0x0',
          }),
    };

    const result = await (
      TrezorConnect as unknown as TrezorConnect.TrezorConnect
    ).ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: baseTx,
    });

    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const { Transaction } = await import('ethers');
    const hash = Transaction.from({
      ...baseTx,
      nonce: parseInt(baseTx.nonce),
      type: isEIP1559 ? 2 : 0,
      signature: { r, s, v: new SwapKitNumber(v).baseValueNumber },
    }).serialized;

    if (!hash) throw new Error('Failed to sign transaction');

    return hash;
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
