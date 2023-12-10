import { derivationPathToString } from '@swapkit/helpers';
import { getNetwork } from '@swapkit/toolbox-utxo';
import type { DerivationPathArray } from '@swapkit/types';
import { Chain, NetworkDerivationPath } from '@swapkit/types';

import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.ts';

export class DogecoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.DOGE) {
    super();
    this.additionalSignParams = { additionals: [], segwit: false, useTrustedInputForSegwit: false };
    this.addressNetwork = getNetwork(Chain.Dogecoin);
    this.chain = 'dogecoin';
    this.walletFormat = 'legacy';

    this.derivationPath = derivationPathToString(derivationPath);
  }
}
