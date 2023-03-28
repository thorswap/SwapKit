import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { derivationPathToString, getWalletFormatFor } from '../helpers/derivationPath.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class LitecoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.LTC) {
    super();
    this.addressNetwork = coininfo.litecoin.main.toBitcoinJS();
    this.chain = 'ltc';
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
