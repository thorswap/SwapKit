import { derivationPathToString } from "@swapkit/helpers";
import type { Provider } from "@swapkit/toolbox-evm";
import type { DerivationPathArray } from "@swapkit/types";
import { ChainId, NetworkDerivationPath } from "@swapkit/types";

import { EthereumLikeLedgerInterface } from "../interfaces/EthereumLikeLedgerInterface.ts";

export class ArbitrumLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.ARB,
    chainId = ChainId.Arbitrum,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.Arbitrum;
    this.chain = "arb";
    this.derivationPath =
      typeof derivationPath === "string" ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new ArbitrumLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
