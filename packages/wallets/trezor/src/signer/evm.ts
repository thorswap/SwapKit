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
  private address: string;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
    super();
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.provider = provider;
    this.address = '';
  }

  getAddress = async () => {
    if (!this.address) {
      const result = await // @ts-ignore ts cant infer type of TrezorConnect
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
    const result = await // @ts-ignore ts cant infer type of TrezorConnect
    (TrezorConnect as unknown as TrezorConnect.TrezorConnect).ethereumSignMessage({
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
            maxFeePerGas: BigNumber.from(restTx.maxFeePerGas).toHexString(),
            maxPriorityFeePerGas: BigNumber.from(restTx.maxPriorityFeePerGas).toHexString(),
          }
        : //@ts-expect-error ts cant infer type of restTx
          { gasPrice: BigNumber.from(restTx.gasPrice).toHexString() }),
    };

    const result = await // @ts-ignore ts cant infer type of TrezorConnect
    (TrezorConnect as unknown as TrezorConnect.TrezorConnect).ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: baseTx,
    });

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
    new TrezorSigner({
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
}
export const getEVMSigner = async ({ chain, derivationPath, provider }: TrezorEVMSignerParams) =>
  new TrezorSigner({ chain, derivationPath, provider });
