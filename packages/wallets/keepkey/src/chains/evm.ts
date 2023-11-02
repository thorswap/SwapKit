import type { EVMTxParams } from '@coinmasters/toolbox-evm';
import type { Chain, DerivationPathArray } from '@coinmasters/types';
import { ChainToChainId } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { AbstractSigner, type JsonRpcProvider, type Provider } from 'ethers';

interface KeepKeyEVMSignerParams {
  sdk: KeepKeySdk;
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider | any; //TODO fixme
}

export class KeepKeySigner extends AbstractSigner {
  private sdk: KeepKeySdk;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  private address: string;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ sdk, chain, derivationPath, provider }: KeepKeyEVMSignerParams) {
    super();
    this.sdk = sdk;
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.address = '';
    this.provider = provider;
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
  }: EVMTxParams | any) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');

    const isEIP1559 = maxFeePerGas && maxPriorityFeePerGas;

    if (isEIP1559 && !maxFeePerGas) throw new Error('Missing maxFeePerGas');
    if (isEIP1559 && !maxPriorityFeePerGas) throw new Error('Missing maxFeePerGas');

    if (!isEIP1559 && !gasPrice) throw new Error('Missing gasPrice');
    const { toHexString } = await import('@coinmasters/toolbox-evm');
    const nonceValue = nonce
      ? BigInt(nonce)
      : BigInt(await this.provider.getTransactionCount(await this.getAddress(), 'pending'));
    const nonceHex = '0x' + nonceValue.toString(16);
    let input = {
      gas: toHexString(BigInt(gasLimit)),
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      from: this.address,
      chainId: toHexString(BigInt(ChainToChainId[this.chain])),
      to,
      value: toHexString(BigInt(value || 0)),
      nonce: nonceHex,
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
    };
    const responseSign = await this.sdk.eth.ethSignTransaction(input);
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
