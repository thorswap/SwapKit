import { defineReadOnly } from '@ethersproject/properties';
import { Provider } from '@ethersproject/providers';
import { ChainId, DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';

import { derivationPathToString } from '../helpers/derivationPath.js';
import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.js';

export class BSCLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.BSC,
    chainId = ChainId.BinanceSmartChain,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super();

    defineReadOnly(this, 'provider', provider || null);

    this.chainId = chainId || ChainId.BinanceSmartChain;
    this.chain = 'bsc';
    this.derivationPath =
      typeof derivationPath === 'string' ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new BSCLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
