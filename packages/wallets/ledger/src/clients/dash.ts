import { derivationPathToString } from "@swapkit/helpers";
import { getNetwork } from "@swapkit/toolbox-utxo";
import type { DerivationPathArray } from "@swapkit/types";
import { Chain, NetworkDerivationPath } from "@swapkit/types";

import { getWalletFormatFor } from "../helpers/derivationPath.ts";
import { UTXOLedgerInterface } from "../interfaces/LedgerInterfaces.ts";

export class DashLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.DASH) {
    super();
    this.addressNetwork = getNetwork(Chain.Dash);
    this.chain = "dash";
    this.derivationPath = derivationPathToString(derivationPath);
    this.walletFormat = getWalletFormatFor(this.derivationPath) as "legacy" | "bech32" | "p2sh";
  }
}
