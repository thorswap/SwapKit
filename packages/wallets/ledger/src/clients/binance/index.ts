import { type DerivationPathArray, NetworkDerivationPath } from "@swapkit/helpers";

import { CosmosLedgerInterface } from "../../interfaces/CosmosLedgerInterface.ts";
import { getAddressFromPublicKey } from "./helpers.ts";

export class BinanceLedger extends CosmosLedgerInterface {
  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.BNB) {
    super();
    this.chain = "bnb";

    this.derivationPath = derivationPath;
  }

  connect = async () => {
    await this.checkOrCreateTransportAndLedger();
    const publicKey = await this.ledgerApp.getPublicKey(this.derivationPath);
    const address = getAddressFromPublicKey(publicKey.pk, this.chain);

    await this.ledgerApp.showAddress(this.chain, this.derivationPath);

    return address;
  };
}
