import type { Chain } from "@swapkit/helpers";

type KeystoreV1 = {
  version: KeystoreVersion.V1;
  meta: string;
  crypto: {
    cipher: string;
    cipherparams: { iv: string };
    ciphertext: string;
    kdf: string;
    kdfparams: { prf: string; dklen: number; salt: string; c: number };
    mac: string;
  };
};

type KeystoreV2 = {
  id: string;
  version: KeystoreVersion.V2;
  pubKeys: { [key: string]: string };
  crypto: {
    cipher: { iv: string; message: string; function: string };
    kdf: {
      function: "pbkdf2" | "scrypt";
      params: { salt: string; keyLength: number; iterations: number };
    };
  };
};

/**
 * Checking on EIP gives us info that those are actually v3 and v4
 * https://eips.ethereum.org/EIPS/eip-2335
 */
export enum KeystoreVersion {
  // This is actually v3
  V1 = 1,
  // This is actually v4
  V2 = 2,
}

export type Keystores = {
  [KeystoreVersion.V1]: KeystoreV1;
  [KeystoreVersion.V2]: KeystoreV2;
};

/**
 * @deprecated use Keystores[KeystoreVersion]
 */
export type Keystore = Keystores[KeystoreVersion.V1];

export type KeystoreOptions = {
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  covalentApiKey?: string;
  stagenet?: boolean;
};

export type GetWalletMethodParams = KeystoreOptions & {
  api?: Todo;
  rpcUrl?: string;
  chain: Chain;
  phrase: string;
  index: number;
};
