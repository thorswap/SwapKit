import { DerivationPathArray, NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { derivationPathToString, getWalletFormatFor } from '../helpers/derivationPath.js';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.js';

export class BitcoinCashLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BCH) {
    super();
    this.additionalSignParams = { segwit: false, additionals: ['abc'], sigHashType: 0x41 };
    this.addressNetwork = coininfo.bitcoincash.main.toBitcoinJS();
    this.chain = 'bch';
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
