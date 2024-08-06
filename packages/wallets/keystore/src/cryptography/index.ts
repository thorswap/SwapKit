import { SwapKitError } from "@swapkit/helpers";

import { generatePhrase } from "../helpers";
import { KeystoreVersion, type Keystores } from "../types";
import { v1DecryptFromKeystore, v1EncryptKeystore } from "./v1";
import { v2DecryptKeystore, v2EncryptKeystore } from "./v2";

export const encryptToKeyStore = v1EncryptKeystore;
export const decryptFromKeystore = v1DecryptFromKeystore;

export function encryptKeystore<T extends KeystoreVersion>({
  type,
  phrase,
  password,
}: {
  type: T;
  phrase: string;
  password: string;
}) {
  switch (type) {
    case KeystoreVersion.V1: {
      return v1EncryptKeystore(phrase, password);
    }
    case KeystoreVersion.V2: {
      return v2EncryptKeystore({ phrase, password });
    }
    default: {
      throw new SwapKitError("wallet_keystore_encrypt_unsupported_version", { version: type });
    }
  }
}

export function decryptKeystore<T extends Keystores[KeystoreVersion]>({
  keystore,
  password,
}: { keystore: T; password: string }) {
  switch (keystore.version) {
    case KeystoreVersion.V1:
      return v1DecryptFromKeystore(keystore, password);
    case KeystoreVersion.V2:
      return v2DecryptKeystore({ keystore, password });
    default: {
      throw new SwapKitError("wallet_keystore_encrypt_unsupported_version", { keystore });
    }
  }
}

export function generateKeystore<T extends KeystoreVersion>({
  type,
  password,
}: { type: T; password: string }) {
  const phrase = generatePhrase(type === KeystoreVersion.V1 ? 12 : 24);
  const keystore = encryptKeystore({ type, phrase, password });

  return { keystore, phrase };
}
