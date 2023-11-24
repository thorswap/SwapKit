import type { EVMTxParams } from '@swapkit/toolbox-evm';
import type { Chain, DerivationPathArray } from '@swapkit/types';
import { ChainToChainId } from '@swapkit/types';
import type { JsonRpcProvider, Provider } from 'ethers';
import { VoidSigner } from 'ethers';

interface KeepKeyEVMSignerParams {
  wallet: any;
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class MetaMaskSigner extends VoidSigner {
  address: string;
  private wallet: any;
  private chain: Chain;
  private derivationPath: DerivationPathArray;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ wallet, chain, derivationPath, provider }: KeepKeyEVMSignerParams) {
    super('');
    this.wallet = wallet;
    this.chain = chain;
    this.derivationPath = derivationPath;
    this.provider = provider;
    this.address = '';
  }

  getAddress = async () => {
    if (!this.address) {
      //ETH path
      let addressInfo = {
        addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        coin: 'Ethereum',
        scriptType: 'ethereum',
        showDisplay: false,
      };
      let response = await this.wallet.ethGetAddress({
        addressaddressNList: addressInfo.addressNList,
      });
      this.address = response;
    }

    return this.address;
  };

  signMessage = async (message: string) => {
    let input = {
      address: this.address,
      message: message, //must be hex encoded
    };
    let response = await this.wallet.ethSign(input);
    return response;
  };

  signTransaction = async ({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');
    if (!restTx) throw new Error('Missing restTx');
    const isEIP1559 = 'maxFeePerGas' in restTx && 'maxPriorityFeePerGas' in restTx;
    const { toHexString } = await import('@swapkit/toolbox-evm');

    const baseTx = {
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      from: this.address,
      chainId: toHexString(BigInt(ChainToChainId[this.chain])),
      to,
      value: toHexString(BigInt(value || 0)),
      gasLimit: toHexString(BigInt(gasLimit)),
      nonce: toHexString(
        BigInt(nonce || (await this.provider.getTransactionCount(from, 'pending'))),
      ),
      data,
      ...(isEIP1559
        ? {
            maxFeePerGas: toHexString(BigInt(restTx?.maxFeePerGas || '0')),
            maxPriorityFeePerGas: toHexString(BigInt(restTx.maxPriorityFeePerGas || '0')),
          }
        : { gasPrice: 'gasPrice' in restTx ? toHexString(BigInt(restTx.gasPrice || '0')) : '0' }),
    };

    let responseSign = await this.wallet.ethSignTx(baseTx);
    return responseSign.serialized;
  };

  connect = (provider: Provider) =>
    new MetaMaskSigner({
      wallet: this.wallet,
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
}

export const getEVMSigner = async ({ wallet, chain, derivationPath, provider }: any) =>
  new MetaMaskSigner({ wallet, chain, derivationPath, provider });
