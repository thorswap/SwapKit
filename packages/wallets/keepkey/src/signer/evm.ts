import { Signer } from '@ethersproject/abstract-signer';
// import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider, Provider } from '@ethersproject/providers';
// import { serialize } from '@ethersproject/transactions';
// import { derivationPathToString } from '@thorswap-lib/helpers';
import {
  Chain,
  // ChainToChainId,
  DerivationPathArray,
  EVMTxParams,
} from '@thorswap-lib/types';
// import TrezorConnect from '@trezor/connect-web';

interface TrezorEVMSignerParams {
  chain: Chain;
  derivationPath: DerivationPathArray;
  provider: Provider | JsonRpcProvider;
}

class KeepKeySigner extends Signer {
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
      let address = '';

      this.address = address;
    }

    return this.address;
  };

  signMessage = async (message: string) => {
    console.log('message:', message);
    return '0x00000000000000';
  };

  signTransaction = async ({ from, to, value, gasLimit, nonce, data, ...restTx }: EVMTxParams) => {
    if (!from) throw new Error('Missing from address');
    if (!to) throw new Error('Missing to address');
    if (!gasLimit) throw new Error('Missing gasLimit');
    if (!value) throw new Error('Missing value');
    if (!nonce) throw new Error('Missing nonce');
    if (!data) throw new Error('Missing data');
    if (!restTx) throw new Error('Missing restTx');

    const signedTx = '0xasdasdasdasdasdasdasdasdasadasdasdas';

    return signedTx;
  };

  connect = (provider: Provider) =>
    new KeepKeySigner({
      chain: this.chain,
      derivationPath: this.derivationPath,
      provider,
    });
}
export const getEVMSigner = async ({ chain, derivationPath, provider }: TrezorEVMSignerParams) =>
  new KeepKeySigner({ chain, derivationPath, provider });
