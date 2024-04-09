import type BitcoinApp from "@ledgerhq/hw-app-btc";
import type { CreateTransactionArg } from "@ledgerhq/hw-app-btc/lib-es/createTransaction";
import { LedgerErrorCode, SwapKitError } from "@swapkit/helpers";
import type { Network as BTCNetwork, Psbt, UTXOType } from "@swapkit/toolbox-utxo";
import { networks } from "@swapkit/toolbox-utxo";

import { BinanceApp } from "../clients/binance/lib.ts";
import { THORChainApp } from "../clients/thorchain/lib.ts";
import { getLedgerTransport } from "../helpers/getLedgerTransport.ts";

import { signUTXOTransaction } from "./utxo.ts";

export abstract class CommonLedgerInterface {
  public ledgerTimeout = 50000;
  public derivationPath: (number | string)[] | string = [];
  public transport: Todo;
  public ledgerApp: Todo;
  public chain: "thor" | "bnb" | "sol" | "cosmos" | "eth" = "thor";

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

export abstract class UTXOLedgerInterface {
  public addressNetwork: BTCNetwork = networks.bitcoin;
  public btcApp: InstanceType<typeof BitcoinApp> | undefined;
  public chain: "bitcoin-cash" | "bitcoin" | "litecoin" | "dogecoin" | "dash" = "bitcoin";
  public derivationPath = "";
  public ledgerApp: Todo;
  public additionalSignParams?: Partial<CreateTransactionArg>;
  public transport = null as Todo | null;
  public walletFormat: "legacy" | "bech32" | "p2sh" = "bech32";

  public connect = async () => {
    await this.checkBtcAppAndCreateTransportWebUSB(false);

    const { default: BitcoinApp } = await import("@ledgerhq/hw-app-btc");

    this.btcApp = new BitcoinApp({ transport: this.transport, currency: this.chain });
  };

  public getExtendedPublicKey = async (path = "84'/0'/0'", xpubVersion = 76067358) => {
    await this.checkBtcAppAndCreateTransportWebUSB(false);

    return this.btcApp?.getWalletXpub({ path, xpubVersion });
  };

  public signTransaction = async (psbt: Psbt, inputUtxos: UTXOType[]) => {
    await this.createTransportWebUSB();

    return signUTXOTransaction(
      { psbt, derivationPath: this.derivationPath, btcApp: this.btcApp, inputUtxos },
      this.additionalSignParams,
    );
  };

  public getAddress = async () => {
    await this.checkBtcAppAndCreateTransportWebUSB(false);

    const { bitcoinAddress: address } =
      (await this.btcApp?.getWalletPublicKey(this.derivationPath, {
        format: this.walletFormat,
      })) || {};

    if (!address) {
      throw new SwapKitError("wallet_ledger_get_address_error", {
        message: `Cannot get ${this.chain} address from ledger derivation path: ${this.derivationPath}`,
      });
    }

    const { toCashAddress } = await import("@swapkit/toolbox-utxo");

    return this.chain === "bitcoin-cash" && this.walletFormat === "legacy"
      ? toCashAddress(address).replace(/(bchtest:|bitcoincash:)/, "")
      : address;
  };

  private checkBtcAppAndCreateTransportWebUSB = async (checkBtcApp = true) => {
    if (checkBtcApp && !this.btcApp) {
      new SwapKitError("wallet_ledger_connection_error", {
        message: `Ledger connection failed:\n${JSON.stringify({
          checkBtcApp,
          btcApp: this.btcApp,
        })}`,
      });
    }

    this.transport ||= await getLedgerTransport();
  };

  private createTransportWebUSB = async () => {
    this.transport = await getLedgerTransport();
    const { default: BitcoinApp } = await import("@ledgerhq/hw-app-btc");

    this.btcApp = new BitcoinApp({ transport: this.transport, currency: this.chain });
  };
}
