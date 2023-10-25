import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { EVMTxParams } from '@swapkit/toolbox-evm';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import { AbstractSigner, type JsonRpcProvider, type Provider } from 'ethers';

interface KeepKeyEVMSignerParams {
  sdk: KeepKeySdk;
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: any; //TODO fixme
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

  signTransaction = async ({
    from,
    to,
    value,
    gasLimit,
    nonce,
    data,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    ...restTx
  }: EVMTxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');
    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;
    if (isEIP1559 && !maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');
    if (!isEIP1559 && !gasPrice) throw new Error('Missing gasPrice');
    const { toHexString } = await import('@swapkit/toolbox-evm');
    const responseSign = await this.sdk.eth.ethSignTransaction({
      gas: toHexString(BigInt(gasLimit)),
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      from: this.address,
      chainId: toHexString(BigInt(ChainToChainId[this.chain])),
      to,
      value: toHexString(BigInt(value || 0)),
      nonce: (
        nonce?.toString() ||
        (await this.provider.getTransactionCount(await this.getAddress(), 'pending'))
      ).toString(),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: toHexString(BigInt(maxFeePerGas?.toString() || '0')),
            maxPriorityFeePerGas: toHexString(BigInt(maxPriorityFeePerGas?.toString() || '0')),
          }
        : {
            gasPrice:
              'gasPrice' in restTx ? toHexString(BigInt(gasPrice?.toString() || '0')) : undefined, // Fixed syntax error and structure here
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
