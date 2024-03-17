import { derivationPathToString } from "@swapkit/helpers";
import type { Provider } from "@swapkit/toolbox-evm";
import type { DerivationPathArray } from "@swapkit/types";
import { ChainId, NetworkDerivationPath } from "@swapkit/types";

import { EthereumLikeLedgerInterface } from "../interfaces/EthereumLikeLedgerInterface.ts";

export class PolygonLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.MATIC,
    chainId = ChainId.Polygon,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.Polygon;
    this.chain = "matic";
    this.derivationPath =
      typeof derivationPath === "string" ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new PolygonLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
