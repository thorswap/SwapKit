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
  params: { [key: string]: string };
  encryptedPhrase: string;
};

export enum KeystoreVersion {
  V1 = 1,
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
