import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import type { EVMTxParams } from '@swapkit/toolbox-evm';
import { AbstractSigner, type JsonRpcProvider, type Provider } from 'ethers';

interface KeepKeyEVMSignerParams {
  sdk: any;
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class KeepKeySigner extends AbstractSigner {
  private sdk: any;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  private address: string;
  private _innerProvider: Provider | JsonRpcProvider;

  constructor({ sdk, chain, derivationPath, provider }: KeepKeyEVMSignerParams) {
    super();
    this.sdk = sdk;
    this.chain = chain;
    this.derivationPath = derivationPath;
    this._innerProvider = provider;
    this.address = '';
  }

  async getAddress() {
    if (!this.address) {
      let addressInfo = {
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        coin: 'Ethereum',
        scriptType: 'ethereum',
        showDisplay: false,
      };
      let response = await this.sdk.address.ethereumGetAddress({
        address_n: addressInfo.addressNList,
      });
      this.address = response.address;
    }
    return this.address;
  }

  async signMessage(message: string) {
    let input = {
      address: this.address,
      message: message,
    };
    let response = await this.sdk.ethSign(input);
    return response;
  }

  signTypedData(): Promise<string> {
    throw new Error('this method is not implemented');
  }

  async signTransaction({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');
    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;

    const baseTx = {
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      from: this.address,
      chainId: BigNumber.from(ChainToChainId[this.chain]).toHexString(),
      to,
      value: BigNumber.from(value || 0).toHexString(),
      gasLimit: BigNumber.from(gasLimit).toHexString(),
      nonce: BigNumber.from(
        nonce || (await this._innerProvider.getTransactionCount(from, 'pending')),
      ).toHexString(),
      data,
      ...(isEIP1559
        ? {
          maxFeePerGas: BigNumber.from(restTx?.maxFeePerGas).toHexString(),
          maxPriorityFeePerGas: BigNumber.from(restTx.maxPriorityFeePerGas).toHexString(),
        }
        : { gasPrice: BigNumber.from(restTx.gasPrice).toHexString() }),
    };
    console.log("baseTx: ", baseTx)
    let responseSign = await this.sdk.eth.ethSignTransaction(baseTx);
    return responseSign.serialized;
  }

  connect(provider: Provider) {
    return new KeepKeySigner({
      sdk: this.sdk,
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
  }
}

export const getEVMSigner = async ({ sdk, chain, derivationPath, provider }: any) =>
  new KeepKeySigner({ sdk, chain, derivationPath, provider });
