import { BigNumber } from '@ethersproject/bignumber';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { EVMTxParams } from '@swapkit/toolbox-evm';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import { AbstractSigner, type JsonRpcProvider, type Provider } from 'ethers';

interface KeepKeyEVMSignerParams {
  sdk: KeepKeySdk;
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

export class KeepKeySigner extends AbstractSigner {
  private sdk: KeepKeySdk;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  private address: string;
  #innerProvider: Provider | JsonRpcProvider;

  constructor({ sdk, chain, derivationPath, provider }: KeepKeyEVMSignerParams) {
    super();
    this.sdk = sdk;
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.#innerProvider = provider;
    this.address = '';
  }

  signTypedData(): Promise<string> {
    throw new Error('this method is not implemented');
  }

  getAddress = async () => {
    if (this.address) return this.address;
    const { address } = await this.sdk.address.ethereumGetAddress({
      address_n: [2147483692, 2147483708, 2147483648, 0, 0],
    });

    this.address = address;
    return address;
  };

  signMessage = async (message: string) => {
    const response = await this.sdk.eth.ethSign({ address: this.address, message });

    return response as string;
  };

  signTransaction = async ({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');
    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;

    const responseSign = await this.sdk.eth.ethSignTransaction({
      // TODO: @highlander - check if this is needed
      // gasLimit: BigNumber.from(gasLimit).toHexString(),
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      from: this.address,
      chainId: BigNumber.from(ChainToChainId[this.chain]).toHexString(),
      to,
      value: BigNumber.from(value || 0).toHexString(),
      nonce: BigNumber.from(
        nonce || (await this.#innerProvider.getTransactionCount(from, 'pending')),
      ).toHexString(),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: BigNumber.from(restTx?.maxFeePerGas).toHexString(),
            maxPriorityFeePerGas: BigNumber.from(restTx.maxPriorityFeePerGas).toHexString(),
          }
        : {
            gasPrice: 'gasPrice' in restTx ? BigNumber.from(restTx?.gasPrice).toHexString() : '0',
          }),
    });
    return responseSign.serialized;
  };

  connect = (provider: Provider) =>
    new KeepKeySigner({
      sdk: this.sdk,
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
}
