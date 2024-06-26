import type { PublicKey, SendOptions, Transaction, VersionedTransaction } from "@solana/web3.js";

type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "connect" | "disconnect" | "accountChanged";

type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signAndSendTransaction"
  | "signAndSendTransactionV0"
  | "signAndSendTransactionV0WithLookupTable"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}
interface PhantomProvider {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  getAddress: () => Promise<string>;
  isConnected: boolean | null;
  isPhantom: boolean;
  on: (event: PhantomEvent, handler: (args: NotWorth) => void) => void;
  publicKey: PublicKey | null;
  request: (method: PhantomRequestMethod, params: NotWorth) => Promise<unknown>;
  signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<NotWorth>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction,
    opts?: SendOptions,
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction,
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[],
  ) => Promise<(Transaction | VersionedTransaction)[]>;
}

declare global {
  interface Window {
    phantom: {
      solana: PhantomProvider;
    };
  }
}
