import { derivationPathToString } from '@swapkit/helpers';
import type { DerivationPathArray } from '@swapkit/types';
import { ChainId, NetworkDerivationPath } from '@swapkit/types';
import type { Provider } from 'ethers';

import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.ts';

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
    super(provider);

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
