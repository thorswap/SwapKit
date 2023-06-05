import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
import { serialize } from '@ethersproject/transactions';
import { derivationPathToString } from '@thorswap-lib/helpers';
import { Chain, ChainToChainId, DerivationPathArray, EIP1559TxParams } from '@thorswap-lib/types';
import TrezorConnect from '@trezor/connect-web';

interface TrezorEVMSignerParams {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class TrezorSigner extends Signer {
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, derivationPath, provider }: TrezorEVMSignerParams) {
    super();
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.provider = provider;
  }

  getAddress = async () => {
    //@ts-ignore
    const result = await TrezorConnect.ethereumGetAddress({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      showOnTrezor: true,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.address;
  };

  signMessage = async (message: string) => {
    //@ts-ignore
    const result = await TrezorConnect.ethereumSignMessage({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      message,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.signature;
  };

  signTransaction = async ({
    from,
    to,
    value,
    gasLimit,
    nonce,
    data,
    maxFeePerGas,
    maxPriorityFeePerGas,
  }: EIP1559TxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!maxPriorityFeePerGas) throw new Error('Missing maxPriorityFeePerGas');

    const baseTx = {
      chainId: BigNumber.from(ChainToChainId[this.chain]).toNumber(),
      to,
      value: BigNumber.from(value || 0).toHexString(),
      gasLimit: BigNumber.from(gasLimit).toHexString(),
      nonce: (nonce || (await this.provider.getTransactionCount(from, 'pending'))).toString(),
      data,
      maxFeePerGas: BigNumber.from(maxFeePerGas).toHexString(),
      maxPriorityFeePerGas: BigNumber.from(maxPriorityFeePerGas).toHexString(),
    };

    //@ts-ignore
    const result = await TrezorConnect.ethereumSignTransaction({
      path: `m/${derivationPathToString(this.derivationPath)}`,
      transaction: baseTx,
    });

    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const signedTx = serialize(
      //TODO: @towan add tx type detection
      { ...baseTx, nonce: BigNumber.from(baseTx.nonce).toNumber(), type: 2 },
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
