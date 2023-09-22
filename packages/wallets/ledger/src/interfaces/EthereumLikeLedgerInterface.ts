import type EthereumApp from '@ledgerhq/hw-app-eth';
import { ChainId } from '@thorswap-lib/types';
import { BN } from 'bn.js';
import { type Provider, VoidSigner } from 'ethers';

import { getLedgerTransport } from '../helpers/getLedgerTransport.ts';

export abstract class EthereumLikeLedgerInterface extends VoidSigner {
  public chain: 'eth' | 'avax' | 'bsc' = 'eth';
  public chainId: ChainId = ChainId.Ethereum;
  public derivationPath: string = '';
  // @ts-expect-error `default` typing is wrong
  public ledgerApp: InstanceType<typeof EthereumApp> | null = null;
  public ledgerTimeout: number = 50000;

  constructor(provider: Provider) {
    super('');

    Object.defineProperty(this, 'provider', {
      enumerable: true,
      value: provider || null,
      writable: false,
    });
  }

  checkOrCreateTransportAndLedger = async () => {
    if (this.ledgerApp) return;
    const transport = await getLedgerTransport();
    const { default: EthereumApp } = await import('@ledgerhq/hw-app-eth');

    // @ts-expect-error `default` typing is wrong
    this.ledgerApp ||= new EthereumApp(transport);
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
    await this.checkOrCreateTransportAndLedger();

    const sig = await this.ledgerApp?.signPersonalMessage(this.derivationPath, messageHex);

    if (!sig) throw new Error('Signing failed');

    const { Signature } = await import('ethers');

    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return Signature.from(sig).serialized;
  };

  signTransaction = async (rawTx: any) => {
    await this.checkOrCreateTransportAndLedger();
    const { resolveProperties } = await import('ethers');

    const tx: any = await resolveProperties(rawTx);
    const transactionCount = await this.provider?.getTransactionCount(tx.from);

    const baseTx = {
      // TODO parse this to number
      chainId: rawTx.chainId || this.chainId,
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      ...(tx.gasPrice && { gasPrice: tx.gasPrice || undefined }),
      ...(!tx.gasPrice &&
        tx.maxFeePerGas && {
          maxFeePerGas: tx.maxFeePerGas || undefined,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
        }),
      nonce: tx.nonce !== undefined ? Number(tx.nonce.toString()) : transactionCount,
      to: tx.to || undefined,
      value: tx.value || undefined,
      type: tx.type || 2,
    };

    const { Transaction } = await import('ethers');
    // TODO: Check this signature
    const unsignedTx = Transaction.from(baseTx).serialized;

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
}
