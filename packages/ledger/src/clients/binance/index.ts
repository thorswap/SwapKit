import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';

import { CommonLedgerInterface } from '../../interfaces/LedgerInterfaces.js';

import { getAddressFromPublicKey } from './helpers.js';

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
