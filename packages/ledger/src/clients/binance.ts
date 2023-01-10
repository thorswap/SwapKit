import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';

import { CommonLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class BinanceLedger extends CommonLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BNB) {
    super();
    this.chain = 'bnb';

    this.derivationPath = derivationPath;
  }

  connect = async () => {
    const binanceJS = await import('@binance-chain/javascript-sdk');
    await this.checkOrCreateTransportAndLedger();
    const publicKey = (await this.ledgerApp.getPublicKey(this.derivationPath)).pk;
    const address = binanceJS.crypto.getAddressFromPublicKey(publicKey, this.chain);

    await this.ledgerApp.showAddress();

    return address;
  };
}
