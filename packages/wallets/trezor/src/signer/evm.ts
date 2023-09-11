import { derivationPathToString } from '@thorswap-lib/swapkit-helpers';
import type { Chain, DerivationPathArray, EVMTxParams } from '@thorswap-lib/types';
import { ChainToChainId } from '@thorswap-lib/types';
import TrezorConnect from '@trezor/connect-web';
import { type JsonRpcProvider, type Provider, VoidSigner } from 'ethers/providers';

interface TrezorEVMSignerParams {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class TrezorSigner extends VoidSigner {
  address: string;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
    super('');
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

  signTransaction = async ({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');

    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;

    if (isEIP1559 && !restTx.maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !restTx.maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!isEIP1559 && (('gasPrice' in restTx && !restTx.gasPrice) || !('gasPrice' in restTx)))
      throw new Error('Missing gasPrice');

    const { toHexString } = await import('@thorswap-lib/toolbox-evm');

    const baseTx = {
      chainId: BigInt(ChainToChainId[this.chain]),
      to,
      value: toHexString(value || 0n),
      gasLimit: toHexString(gasLimit),
      nonce: BigNumber.from(
        nonce || (await this.provider.getTransactionCount(from, 'pending')),
      ).toHexString(),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: BigNumber.from(restTx.maxFeePerGas).toHexString(),
            maxPriorityFeePerGas: BigNumber.from(restTx.maxPriorityFeePerGas).toHexString(),
          }
        : //@ts-expect-error ts cant infer type of restTx
          { gasPrice: BigNumber.from(restTx.gasPrice).toHexString() }),
    };

    const result = await (
      TrezorConnect as unknown as TrezorConnect.TrezorConnect
    ).ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: baseTx,
    });

    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const { Transaction } = await import('ethers/transaction');
    const hash = Transaction.from({
      ...baseTx,
      nonce: BigNumber.from(baseTx.nonce).toNumber(),
      type: isEIP1559 ? 2 : 0,
      signature: { r, s, v: BigNumber.from(v).toNumber() },
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
