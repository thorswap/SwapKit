import { defineReadOnly } from '@ethersproject/properties';
import { Provider } from '@ethersproject/providers';
import { ChainId, DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';

import { derivationPathToString } from '../helpers/derivationPath.js';
import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.js';

export class AvalancheLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.AVAX,
    chainId = ChainId.Avalanche,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super();

    defineReadOnly(this, 'provider', provider || null);

    this.chainId = chainId || ChainId.Avalanche;
    this.chain = 'avax';
    this.derivationPath =
      typeof derivationPath === 'string' ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new AvalancheLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
