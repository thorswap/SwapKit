import { derivationPathToString } from '@thorswap-lib/helpers';
import type { DerivationPathArray } from '@thorswap-lib/types';
import { NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.ts';

export class DogecoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.DOGE) {
    super();
    this.additionalSignParams = { additionals: [], segwit: false, useTrustedInputForSegwit: false };
    this.addressNetwork = coininfo.dogecoin.main.toBitcoinJS();
    this.chain = 'doge';
    this.walletFormat = 'legacy';

    this.derivationPath = derivationPathToString(derivationPath);
  }
}
