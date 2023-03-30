import { DerivationPath } from '@thorswap-lib/types';

import { CommonLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class CosmosLedger extends CommonLedgerInterface {
  public derivationPath: string;

  constructor(derivationPath: DerivationPath = DerivationPath.GAIA) {
    super();
    this.chain = 'cosmos';
    this.derivationPath = derivationPath;
  }

  connect = async () => {
    await this.checkOrCreateTransportAndLedger();
    const { address } = await this.ledgerApp.getAddress(DerivationPath.GAIA, this.chain);

    return address;
  };
}
