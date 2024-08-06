import crypto from "crypto";

import { blake256, getPBKDF2DerivedKey } from "../helpers";
import { KeystoreVersion, type Keystores } from "../types";

export function v1EncryptKeystore(phrase: string, password: string): Keystores[KeystoreVersion.V1] {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const kdfParams = { c: 262144, prf: "hmac-sha256", dklen: 32, salt: salt.toString("hex") };
  const cipher = "aes-128-ctr";

  const derivedKey = getPBKDF2DerivedKey({
    passphrase: password,
    salt,
    iterations: kdfParams.c,
    keyLength: kdfParams.dklen,
    digest: "sha256",
  });
  const cipherIV = crypto.createCipheriv(cipher, derivedKey.subarray(0, 16), iv);
  const ciphertext = Buffer.concat([
    cipherIV.update(Buffer.from(phrase, "utf8")),
    cipherIV.final(),
  ]);

  return {
    meta: "xchain-keystore",
    version: KeystoreVersion.V1,
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

export function v1DecryptFromKeystore(keystore: Keystores[KeystoreVersion.V1], password: string) {
  if (!keystore?.crypto?.kdfparams || keystore?.version !== KeystoreVersion.V1) {
    throw new Error("Invalid keystore");
  }
  const { kdfparams, cipher, cipherparams, ciphertext, mac } = keystore.crypto;
  const { c, dklen, salt } = kdfparams;

  const derivedKey = getPBKDF2DerivedKey({
    passphrase: password,
    salt,
    iterations: c,
    keyLength: dklen,
    digest: "sha256",
  });
  const computedCiphertext = Buffer.from(ciphertext, "hex");
  const computedMac = blake256(Buffer.concat([derivedKey.subarray(16, 32), computedCiphertext]));

  if (mac !== computedMac) {
    throw new Error("Invalid password");
  }

  const decipher = crypto.createDecipheriv(
    cipher,
    derivedKey.subarray(0, 16),
    Buffer.from(cipherparams.iv, "hex"),
  );

  const phrase = Buffer.concat([decipher.update(computedCiphertext), decipher.final()]).toString(
    "utf8",
  );

  return phrase;
}
