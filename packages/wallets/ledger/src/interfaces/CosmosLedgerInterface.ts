import {
  type DerivationPathArray,
  LedgerErrorCode,
  NetworkDerivationPath,
  SwapKitError,
} from "@swapkit/helpers";

import { BinanceApp } from "../clients/binance/lib.ts";
import { THORChainApp } from "../clients/thorchain/lib.ts";
import { getLedgerTransport } from "../helpers/getLedgerTransport.ts";

export abstract class CosmosLedgerInterface {
  public ledgerTimeout = 50000;
  public derivationPath: DerivationPathArray | string = NetworkDerivationPath.GAIA;
  public transport: Todo;
  public ledgerApp: Todo;
  public chain: "thor" | "bnb" | "cosmos" = "thor";

  public checkOrCreateTransportAndLedger = async (forceReconnect = false) => {
    if (!forceReconnect && this.transport && this.ledgerApp) return;

    try {
      this.transport =
        forceReconnect || !this.transport ? await getLedgerTransport() : this.transport;

      switch (this.chain) {
        case "bnb": {
          this.ledgerApp =
            forceReconnect || !this.ledgerApp ? new BinanceApp(this.transport) : this.ledgerApp;

          break;
        }

        case "thor": {
          this.ledgerApp =
            forceReconnect || !this.ledgerApp ? new THORChainApp(this.transport) : this.ledgerApp;

          break;
        }

        case "cosmos": {
          const { default: CosmosApp } = await import("@ledgerhq/hw-app-cosmos");
          this.ledgerApp =
            forceReconnect || !this.ledgerApp ? new CosmosApp(this.transport) : this.ledgerApp;
        }
      }

      return this.ledgerApp;
    } catch (error: unknown) {
      throw new SwapKitError("wallet_ledger_connection_error", error);
    }
  };

  public validateResponse = (errorCode: LedgerErrorCode, message?: string) => {
    switch (errorCode) {
      case LedgerErrorCode.NoError:
        return;

      case LedgerErrorCode.LockedDevice:
        throw new SwapKitError("wallet_ledger_device_locked", {
          message: `Ledger is locked: ${message}`,
        });

      case LedgerErrorCode.TC_NotFound:
        throw new SwapKitError("wallet_ledger_device_not_found");

      default: {
        console.error(`Ledger error: ${errorCode} ${message}`);
        break;
      }
    }
  };
}
