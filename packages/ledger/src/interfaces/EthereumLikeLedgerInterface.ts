import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { joinSignature } from '@ethersproject/bytes';
import { resolveProperties } from '@ethersproject/properties';
import { serialize, UnsignedTransaction } from '@ethersproject/transactions';
import EthereumApp, { ledgerService } from '@ledgerhq/hw-app-eth';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { ChainId } from '@thorswap-lib/types';
import { BN } from 'bn.js';

export abstract class EthereumLikeLedgerInterface extends Signer {
  public chain: 'eth' | 'avax' | 'bsc' = 'eth';
  public chainId: ChainId = ChainId.Ethereum;
  public derivationPath: string = '';
  // @ts-ignore Ledger typing is wrong
  public ledgerApp: InstanceType<typeof EthereumApp> | null = null;
  public ledgerTimeout: number = 50000;

  checkOrCreateTransportAndLedger = async () => {
    // @ts-ignore Ledger typing is wrong
    if (!(await TransportWebUSB.isSupported())) throw new Error('Ledger not supported');

    // @ts-ignore Ledger typing is wrong
    const transport = await TransportWebUSB.create();
    // @ts-ignore Ledger typing is wrong
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
    sig.r = '0x' + sig.r;
    sig.s = '0x' + sig.s;
    return joinSignature(sig);
  };

  signTransaction = async (rawTx: any) => {
    await this.checkOrCreateTransportAndLedger();
    const tx: any = await resolveProperties(rawTx);
    const transactionCount = await this.getTransactionCount();

    const baseTx: UnsignedTransaction = {
      chainId: BigNumber.from(rawTx.chainId || this.chainId).toNumber(),
      data: tx.data || undefined,
      gasLimit: tx.gasLimit || undefined,
      ...(tx.gasPrice && { gasPrice: tx.gasPrice || undefined }),
      ...(!tx.gasPrice &&
        tx.maxFeePerGas && {
          maxFeePerGas: tx.maxFeePerGas || undefined,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
        }),
      nonce:
        tx.nonce !== undefined ? BigNumber.from(tx.nonce.toString()).toNumber() : transactionCount,
      to: tx.to || undefined,
      value: tx.value || undefined,
      type: tx.type || 2,
    };

    const unsignedTx = serialize(baseTx).slice(2);

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

    return (
      '0x' +
      serialize(baseTx, {
        v: new BN(parseInt(signature.v, 16)).toNumber(),
        r: '0x' + signature.r,
        s: '0x' + signature.s,
      }).slice(2)
    );
  };
}
