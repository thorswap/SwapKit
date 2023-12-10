import { derivationPathToString } from '@swapkit/helpers';
import { getNetwork } from '@swapkit/toolbox-utxo';
import type { DerivationPathArray } from '@swapkit/types';
import { Chain, NetworkDerivationPath } from '@swapkit/types';

import { getWalletFormatFor } from '../helpers/derivationPath.ts';
import { UTXOLedgerInterface } from '../interfaces/LedgerInterfaces.ts';

export class BitcoinCashLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BCH) {
    super();
    this.additionalSignParams = { segwit: false, additionals: ['abc'], sigHashType: 0x41 };
    this.addressNetwork = getNetwork(Chain.BitcoinCash);
    this.chain = 'bitcoin-cash';
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as 'legacy' | 'bech32';
  }
}
