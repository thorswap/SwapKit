import { derivationPathToString } from "@swapkit/helpers";
import type { Provider } from "@swapkit/toolbox-evm";
import type { DerivationPathArray } from "@swapkit/types";
import { ChainId, NetworkDerivationPath } from "@swapkit/types";

import { EthereumLikeLedgerInterface } from "../interfaces/EthereumLikeLedgerInterface.ts";

export class OptimismLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.OP,
    chainId = ChainId.Optimism,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.Optimism;
    this.chain = "op";
    this.derivationPath =
      typeof derivationPath === "string" ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new OptimismLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
