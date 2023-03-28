import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
import { networks } from 'bitcoinjs-lib';

import { derivationPathToString, getWalletFormatFor } from '../helpers/derivationPath.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class BitcoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BTC) {
    super();
    this.addressNetwork = networks.bitcoin;
    this.chain = 'btc';
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
