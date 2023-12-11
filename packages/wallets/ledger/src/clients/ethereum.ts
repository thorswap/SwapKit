import { derivationPathToString } from '@swapkit/helpers';
import type { Provider } from '@swapkit/toolbox-evm';
import type { DerivationPathArray } from '@swapkit/types';
import { ChainId, NetworkDerivationPath } from '@swapkit/types';

import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.ts';

export class EthereumLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.ETH,
    chainId,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.Ethereum;
    this.chain = 'eth';
    this.derivationPath =
      typeof derivationPath === 'string' ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new EthereumLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
