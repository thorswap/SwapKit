import { derivationPathToString } from '@thorswap-lib/helpers';
import type { DerivationPathArray } from '@thorswap-lib/types';
import { NetworkDerivationPath } from '@thorswap-lib/types';
// @ts-expect-error
import coininfo from 'coininfo';

import { getWalletFormatFor } from '../helpers/derivationPath.ts';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.ts';

export class LitecoinLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.LTC) {
    super();
    this.addressNetwork = coininfo.litecoin.main.toBitcoinJS();
    this.chain = 'ltc';
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
