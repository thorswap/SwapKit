import { derivationPathToString } from "@swapkit/helpers";
import { getNetwork } from "@swapkit/toolbox-utxo";
import type { DerivationPathArray } from "@swapkit/types";
import { Chain, NetworkDerivationPath } from "@swapkit/types";

import { UTXOLedgerInterface } from "../interfaces/LedgerInterfaces.ts";

export class DashLedger extends UTXOLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.DASH) {
    super();
    this.additionalSignParams = { additionals: [], segwit: false, useTrustedInputForSegwit: false };
    this.addressNetwork = getNetwork(Chain.Dash);
    this.chain = "dash";
    this.walletFormat = "legacy";

    this.derivationPath = derivationPathToString(derivationPath);
  }
}
