import type EthereumApp from '@ledgerhq/hw-app-eth';
import { ChainId } from '@swapkit/types';
import { BN } from 'bn.js';
import type { Provider, TransactionRequest } from 'ethers';
import { AbstractSigner } from 'ethers';

import { getLedgerTransport } from '../helpers/getLedgerTransport.ts';

export abstract class EthereumLikeLedgerInterface extends AbstractSigner {
  public chain: 'eth' | 'avax' | 'bsc' = 'eth';
  public chainId: ChainId = ChainId.Ethereum;
  public derivationPath: string = '';
  // @ts-expect-error `default` typing is wrong
  public ledgerApp: InstanceType<typeof EthereumApp> | null = null;
  public ledgerTimeout: number = 50000;

  constructor(provider: Provider) {
    super(provider);

    Object.defineProperty(this, 'provider', {
      enumerable: true,
      value: provider || null,
      writable: false,
    });
  }

  checkOrCreateTransportAndLedger = async () => {
    if (this.ledgerApp) return;
    await this.createTransportAndLedger();
  };

  createTransportAndLedger = async () => {
    const transport = await getLedgerTransport();
    const { default: EthereumApp } = await import('@ledgerhq/hw-app-eth');

    // @ts-expect-error `default` typing is wrong
    this.ledgerApp = new EthereumApp(transport);
  };

  getAddress = async () => {
    const response = await this.getAddressAndPubKey();
    if (!response) throw new Error('Could not get Address');
    return response.address;
  };

  getAddressAndPubKey = async () => {
    await this.checkOrCreateTransportAndLedger();
    return this.ledgerApp?.getAddress(this.derivationPath);
  };

  showAddressAndPubKey = async () => {
    await this.checkOrCreateTransportAndLedger();
    return this.ledgerApp?.getAddress(this.derivationPath, true);
  };

  signMessage = async (messageHex: string) => {
    await this.createTransportAndLedger();

    const sig = await this.ledgerApp?.signPersonalMessage(this.derivationPath, messageHex);

    if (!sig) throw new Error('Signing failed');

    const { Signature } = await import('ethers');

    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return Signature.from(sig).serialized;
  };

  signTransaction = async (tx: TransactionRequest) => {
    await this.createTransportAndLedger();

    const transactionCount = await this.provider?.getTransactionCount(
      tx.from || (await this.getAddress()),
    );

    const baseTx = {
      chainId: tx.chainId || this.chainId,
      data: tx.data,
      gasLimit: tx.gasLimit,
      ...(tx.gasPrice && { gasPrice: tx.gasPrice }),
      ...(!tx.gasPrice &&
        tx.maxFeePerGas && {
          maxFeePerGas: tx.maxFeePerGas,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        }),
      nonce:
        tx.nonce !== undefined
          ? Number((tx.nonce || transactionCount || 0).toString())
          : transactionCount,
      to: tx.to?.toString(),
      value: tx.value,
      type: tx.type && !isNaN(tx.type) ? tx.type : tx.maxFeePerGas ? 2 : 0,
    };

    const { Transaction } = await import('ethers');
    // ledger expects the tx to be serialized without the 0x prefix
    const unsignedTx = Transaction.from(baseTx).unsignedSerialized.slice(2);

    const { ledgerService } = await import('@ledgerhq/hw-app-eth');

    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      {},
      { externalPlugins: true, erc20: true },
    );

    const signature = await this.ledgerApp?.signTransaction(
      this.derivationPath,
      unsignedTx,
      resolution,
    );

    if (!signature) throw new Error('Could not sign transaction');

    const { r, s, v } = signature;

    return Transaction.from({
      ...baseTx,
      signature: { v: new BN(parseInt(v, 16)).toNumber(), r: '0x' + r, s: '0x' + s },
    }).serialized;
  };

  sendTransaction = async (tx: TransactionRequest) => {
    if (!this.provider) throw new Error('No provider set');

    const signedTxHex = await this.signTransaction(tx);

    return await this.provider.broadcastTransaction(signedTxHex);
  };

  signTypedData(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
