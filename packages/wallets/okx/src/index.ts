import { StdSignature } from '@thorswap-lib/toolbox-cosmos';
import { EthereumWindowProvider } from '@thorswap-lib/toolbox-evm';

import { AminoSignResponse, OfflineAminoSigner, StdSignDoc } from './types.js';

export { okxWallet } from './okxWallet.js';

declare global {
  interface Window {
    okxwallet?: EthereumWindowProvider & {
      bitcoin: {
        connect: () => Promise<{
          address: string;
          publicKey: string;
        }>;
        disconnect: () => Promise<void>;
        signMessage: (message: string, { from }: { from: string }) => Promise<string>;
        signPsbt: (
          psbtHex: string,
          { from, type }: { from: string; type: string },
        ) => Promise<string>;
      };
      keplr: {
        enable: (chainId: string | string[]) => Promise<void>;
        signAmino: (
          chainId: string,
          signer: string,
          signDoc: StdSignDoc,
          signOptions: any,
        ) => Promise<AminoSignResponse>;
        signArbitrary: (
          chainId: string,
          signer: string,
          data: string | Uint8Array,
        ) => Promise<StdSignature>;
        verifyArbitrary: (
          chainId: string,
          signer: string,
          data: string | Uint8Array,
          signature: StdSignature,
        ) => Promise<boolean>;
        getOfflineSignerOnlyAmino: (chainId: string) => OfflineAminoSigner;
      };
    };
  }
}
