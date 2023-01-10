export type CreateTransactionArg = {
  inputs: [any, number, string | null | undefined, number | null | undefined][];
  associatedKeysets: string[];
  changePath?: string;
  outputScriptHex: string;
  lockTime?: number;
  sigHashType?: number;
  segwit?: boolean;
  initialTimestamp?: number;
  additionals: string[];
  expiryHeight?: Buffer;
  useTrustedInputForSegwit?: boolean;
  onDeviceStreaming?: (arg0: { progress: number; total: number; index: number }) => void;
  onDeviceSignatureRequested?: () => void;
  onDeviceSignatureGranted?: () => void;
};
