import { derivationPathToString } from '@coinmasters/helpers';
import type { DerivationPathArray } from '@coinmasters/types';
import { NetworkDerivationPath } from '@coinmasters/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { getWalletFormatFor } from '../helpers/derivationPath.ts';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.ts';

export class BitcoinCashLedger extends UTXOLedgerInterface {
  constructor(paths) {
    super();
    this.paths = paths;
    this.additionalSignParams = { segwit: false, additionals: ['abc'], sigHashType: 0x41 };
    this.addressNetwork = coininfo.bitcoincash.main.toBitcoinJS();
    this.chain = 'bch';
    this.derivationPath = derivationPathToString(NetworkDerivationPath.BCH);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
