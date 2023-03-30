import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';

import { derivationPathToString } from '../helpers/derivationPath.js';
import { CommonLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class CosmosLedger extends CommonLedgerInterface {
  public derivationPath: DerivationPathArray;

  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.GAIA) {
    super();
    this.chain = 'cosmos';
    this.derivationPath = derivationPath;
  }

  connect = async () => {
    await this.checkOrCreateTransportAndLedger();
    const { address } = await this.ledgerApp.getAddress(
      derivationPathToString(this.derivationPath),
      this.chain,
    );

    return address;
  };
}
