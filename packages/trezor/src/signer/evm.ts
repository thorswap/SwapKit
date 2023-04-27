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

export const getEVMSigner = async ({ chain, derivationPath, provider }: TrezorEVMSignerParams) => {
  const getAddress = async () => {
    //@ts-ignore
    const result = await TrezorConnect.ethereumGetAddress({
      path: `m/${derivationPathToString(derivationPath)}`,
      showOnTrezor: true,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.address;
  };

  const signMessage = async (message: string) => {
    //@ts-ignore
    const result = await TrezorConnect.ethereumSignMessage({
      path: `m/${derivationPathToString(derivationPath)}`,
      message,
    });

    if (!result.success) throw new Error(result.payload.error);

    return result.payload.signature;
  };

  const signTransaction = async ({
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
    if (!value) throw new Error('Missing value');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!maxPriorityFeePerGas) throw new Error('Missing maxPriorityFeePerGas');

    const baseTx = {
      chainId: BigNumber.from(ChainToChainId[chain]).toNumber(),
      to,
      value: BigNumber.from(value).toHexString(),
      gasLimit: BigNumber.from(gasLimit).toHexString(),
      nonce: (nonce || (await provider.getTransactionCount(from, 'pending'))).toString(),
      data,
      maxFeePerGas: BigNumber.from(maxFeePerGas).toHexString(),
      maxPriorityFeePerGas: BigNumber.from(maxPriorityFeePerGas).toHexString(),
    };

    //@ts-ignore
    const result = await TrezorConnect.ethereumSignTransaction({
      path: `m/${derivationPathToString(derivationPath)}`,
      transaction: baseTx,
    });

    if (!result.success) throw new Error(result.payload.error);

    const { r, s, v } = result.payload;

    const signedTx = serialize(
      { ...baseTx, nonce: BigNumber.from(baseTx.nonce).toNumber(), type: 2 },
      {
        r,
        s,
        v: BigNumber.from(v).toNumber(),
      },
    );

    return signedTx;
  };

  const connect = (provider: Provider) => {
    return getEVMSigner({ chain, derivationPath, provider });
  };

  return {
    _isSigner: true,
    provider,
    getAddress,
    signMessage,
    signTransaction,
    connect,
  };
};
