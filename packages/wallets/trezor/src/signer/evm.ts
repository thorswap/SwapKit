import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import { serialize } from '@ethersproject/transactions';
import { derivationPathToString } from '@thorswap-lib/helpers';
import { Chain, ChainToChainId, DerivationPathArray, EVMTxParams } from '@thorswap-lib/types';
import TrezorConnect from '@trezor/connect-web';

interface TrezorEVMSignerParams {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class TrezorSigner extends Signer {
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  private address: string | undefined;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
    super();
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.provider = provider;
  }

  getAddress = async () => {
    if (!this.address) {
      const result = await //@ts-ignore ts can't infer type
      (TrezorConnect as unknown as TrezorConnect.TrezorConnect).ethereumGetAddress({
        path: `m/${derivationPathToString(this.derivationPath)}`,
        showOnTrezor: true,
      });

      if (!result.success) throw new Error(result.payload.error);
      this.address = result.payload.address;
    }

    return this.address;
  };

  signMessage = async (message: string) => {
    const result = await //@ts-ignore ts can't infer type
    (TrezorConnect as unknown as TrezorConnect.TrezorConnect).ethereumSignMessage({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      message,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.signature;
  };

  signTransaction = async (tx: EVMTxParams) => {
    const { from, to, value, gasLimit, nonce, data } = tx;
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    const isEIP1559 = 'maxFeePerGas' in tx && 'maxPriorityFeePerGas' in tx;
    if (isEIP1559 && !tx.maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !tx.maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!isEIP1559 && (('gasPrice' in tx && !tx.gasPrice) || !('gasPrice' in tx)))
      throw new Error('Missing gasPrice');

    const baseTx = {
      chainId: BigNumber.from(ChainToChainId[this.chain]).toNumber(),
      to,
      value: BigNumber.from(value || 0).toHexString(),
      gasLimit: BigNumber.from(gasLimit).toHexString(),
      nonce: BigNumber.from(
        nonce || (await this.provider.getTransactionCount(from, 'pending')),
      ).toHexString(),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: BigNumber.from(tx.maxFeePerGas).toHexString(),
            maxPriorityFeePerGas: BigNumber.from(tx.maxPriorityFeePerGas).toHexString(),
          }
        : //@ts-expect-error ts cant infer type of tx
          { gasPrice: BigNumber.from(tx.gasPrice).toHexString() }),
    };

    const result = await //@ts-ignore ts can't infer type
    (TrezorConnect as unknown as TrezorConnect.TrezorConnect).ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: baseTx,
    });
    debugger;
    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const signedTx = serialize(
      { ...baseTx, nonce: BigNumber.from(baseTx.nonce).toNumber(), type: isEIP1559 ? 2 : 0 },
      {
        r,
        s,
        v: BigNumber.from(v).toNumber(),
      },
    );

    return signedTx;
  };

  connect = (provider: Provider) =>
    new TrezorSigner({ chain: this.chain, derivationPath: this.derivationPath, provider });
}
export const getEVMSigner = async ({ chain, derivationPath, provider }: TrezorEVMSignerParams) =>
  new TrezorSigner({ chain, derivationPath, provider });
