import crypto from "crypto";
import { SwapKitError } from "@swapkit/helpers";

import { blake256, pbkdf2Async } from "./helpers";
import { KeystoreVersion, type Keystores } from "./types";

async function v1EncryptKeystore(phrase: string, password: string) {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const kdfParams = { c: 262144, prf: "hmac-sha256", dklen: 32, salt: salt.toString("hex") };
  const cipher = "aes-128-ctr";

  const derivedKey = await pbkdf2Async(password, salt, kdfParams.c, kdfParams.dklen, "sha256");
  const cipherIV = crypto.createCipheriv(cipher, derivedKey.subarray(0, 16), iv);
  const ciphertext = Buffer.concat([
    cipherIV.update(Buffer.from(phrase, "utf8")),
    cipherIV.final(),
  ]);

  return {
    meta: "xchain-keystore",
    version: 1,
    crypto: {
      cipher,
      cipherparams: { iv: iv.toString("hex") },
      ciphertext: ciphertext.toString("hex"),
      kdf: "pbkdf2",
      kdfparams: kdfParams,
      mac: blake256(Buffer.concat([derivedKey.subarray(16, 32), Buffer.from(ciphertext)])),
    },
  };
}

async function v1DecryptFromKeystore(keystore: Keystores[KeystoreVersion.V1], password: string) {
  switch (keystore.version) {
    case 1: {
      const kdfparams = keystore.crypto.kdfparams;
      const derivedKey = await pbkdf2Async(
        password,
        Buffer.from(kdfparams.salt, "hex"),
        kdfparams.c,
        kdfparams.dklen,
        "sha256",
      );

      const ciphertext = Buffer.from(keystore.crypto.ciphertext, "hex");
      const mac = blake256(Buffer.concat([derivedKey.subarray(16, 32), ciphertext]));

      if (mac !== keystore.crypto.mac) throw new Error("Invalid password");
      const decipher = crypto.createDecipheriv(
        keystore.crypto.cipher,
        derivedKey.subarray(0, 16),
        Buffer.from(keystore.crypto.cipherparams.iv, "hex"),
      );

      const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return phrase.toString("utf8");
    }

    default:
      throw new Error("Unsupported keystore version");
  }
}

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
      // return v2EncryptKeystore(phrase, password);
      return {} as never;
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
      // return decryptFromKeystore(keystore, password);
      return {} as never;
    default: {
      throw new SwapKitError("wallet_keystore_encrypt_unsupported_version", { keystore });
    }
  }
}

export const encryptToKeyStore = v1EncryptKeystore;
export const decryptFromKeystore = v1DecryptFromKeystore;
