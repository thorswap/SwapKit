import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { derivationPathToString } from '../helpers/getDerivationPathFor.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class BitcoinCashLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BCH) {
    super();
    this.additionalSignParams = { segwit: false, additionals: ['abc'], sigHashType: 0x41 };
    this.addressNetwork = coininfo.bitcoincash.main.toBitcoinJS();
    this.chain = 'bch';
    this.walletFormat = 'bech32';
    this.derivationPath = derivationPathToString(derivationPath);
  }
}
