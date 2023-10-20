import type { DerivationPathArray } from '@coinmasters/types';
import { NetworkDerivationPath } from '@coinmasters/types';

import { CommonLedgerInterface } from '../../interfaces/LedgerInterfaces.ts';

import { getAddressFromPublicKey } from './helpers.ts';

export class BinanceLedger extends CommonLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BNB) {
    super();
    this.chain = 'bnb';

    this.derivationPath = derivationPath;
  }

  connect = async () => {
    await this.checkOrCreateTransportAndLedger();
    const publicKey = await this.ledgerApp.getPublicKey(this.derivationPath);
    const address = getAddressFromPublicKey(publicKey.pk, this.chain);

    await this.ledgerApp.showAddress();

    return address;
  };
}
