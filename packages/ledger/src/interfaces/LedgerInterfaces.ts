import BitcoinApp from '@ledgerhq/hw-app-btc';
import CosmosApp from '@ledgerhq/hw-app-cosmos';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import type { UTXO } from '@thorswap-lib/types';
import { type Network as BTCNetwork, networks, type Psbt } from 'bitcoinjs-lib';

import THORChainApp from '../clients/thorchain/lib.js';

import { CreateTransactionArg } from './types.js';
import { signUTXOTransaction } from './utxo.js';

export abstract class CommonLedgerInterface {
  public ledgerTimeout: number = 50000;
  public derivationPath: (number | string)[] | string = [];
  public transport: any;
  public ledgerApp: any;
  public test: any;
  public chain: 'thor' | 'bnb' | 'sol' | 'cosmos' | 'eth' = 'thor';

  public checkOrCreateTransportAndLedger = async () => {
    // @ts-ignore Ledger typing is wrong
    if (!(await TransportWebUSB.isSupported())) throw new Error('Ledger not supported');

    try {
      // @ts-ignore Ledger typing is wrong
      this.transport ||= await TransportWebUSB.create();

      switch (this.chain) {
        case 'bnb': {
          const binanceJS = await import('@binance-chain/javascript-sdk');
          this.ledgerApp ||= new binanceJS.ledger.app(this.transport);
          break;
        }

        case 'thor': {
          this.ledgerApp ||= new THORChainApp(this.transport);
          break;
        }

        case 'cosmos': {
          // @ts-expect-error
          this.ledgerApp ||= new CosmosApp(this.transport);
          break;
        }
      }
    } catch (error: any) {
      throw new Error('Cannot create transport or ledger client');
    }
  };
}

export abstract class UTXOLedgerInterface {
  public addressNetwork: BTCNetwork = networks.bitcoin;
  // @ts-ignore Ledger typing is wrong
  public btcApp: InstanceType<typeof BitcoinApp> | null = null;
  public chain: 'bch' | 'btc' | 'ltc' | 'doge' = 'btc';
  public derivationPath = '';
  public ledgerApp: any;
  public additionalSignParams?: Partial<CreateTransactionArg>;
  public transport = null as any;
  public walletFormat: 'legacy' | 'bech32' = 'bech32';

  public connect = async () => {
    await this.checkBtcAppAndCreateTransportWebUSB(false);

    // @ts-ignore Ledger typing is wrong
    this.btcApp = new BitcoinApp(this.transport);
  };

  public signTransaction = async (psbt: Psbt, utxo: UTXO[]) => {
    await this.checkBtcAppAndCreateTransportWebUSB();

    return signUTXOTransaction(
      { psbt, derivationPath: this.derivationPath, btcApp: this.btcApp, utxo },
      this.additionalSignParams,
    );
  };

  public getAddress = async () => {
    await this.checkBtcAppAndCreateTransportWebUSB();

    const { bitcoinAddress } = await this.btcApp!.getWalletPublicKey(this.derivationPath, {
      format: this.walletFormat,
    });

    if (!bitcoinAddress) throw new Error('Invalid bitcoinAddress');

    return bitcoinAddress;
  };

  private checkBtcAppAndCreateTransportWebUSB = async (checkBtcApp: boolean = true) => {
    // @ts-ignore Ledger typing is wrong
    if ((checkBtcApp && !this.btcApp) || !(await TransportWebUSB.isSupported())) {
      const errorData = JSON.stringify({
        checkBtcApp,
        btcApp: this.btcApp,
        // @ts-ignore Ledger typing is wrong
        supported: await TransportWebUSB.isSupported(),
      });
      throw new Error(`Ledger connection failed: \n${errorData}`);
    }

    // @ts-ignore Ledger typing is wrong
    this.transport ||= await TransportWebUSB.create();
  };

  public getExtendedPublicKey = async (
    path: string = "84'/0'/0'",
    xpubVersion: number = 76067358,
  ) => {
    await this.checkBtcAppAndCreateTransportWebUSB();

    return this.btcApp!.getWalletXpub({
      path,
      xpubVersion,
    });
  };
}
