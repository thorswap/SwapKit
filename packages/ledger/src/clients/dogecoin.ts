import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { derivationPathToString } from '../helpers/derivationPath.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

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
