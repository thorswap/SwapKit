import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
import { networks } from 'bitcoinjs-lib';

import { derivationPathToString } from '../helpers/getDerivationPathFor.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class BitcoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BTC) {
    super();
    this.addressNetwork = networks.bitcoin;
    this.chain = 'btc';
    this.walletFormat = 'bech32';

    this.derivationPath = derivationPathToString(derivationPath);
  }
}
