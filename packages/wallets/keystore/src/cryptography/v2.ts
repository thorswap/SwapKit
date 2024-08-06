import { getRandomBytesSync } from "ethereum-cryptography/random";
import { getPBKDF2DerivedKey, getScryptDerivedKey } from "../helpers";
import type { KeystoreVersion, Keystores } from "../types";

export function v2EncryptKeystore({
  phrase,
  password: passphrase,
  kdf = "pbkdf2",
}: {
  phrase: string;
  password: string;
  kdf?: "pbkdf2" | "scrypt";
}): Keystores[KeystoreVersion.V2] {
  const salt = getRandomBytesSync(32);
  const iv = getRandomBytesSync(16);

  const iterations = kdf === "pbkdf2" ? 10 ** 6 : 2 ** 16; // 1_000_000 : 262_144;
  const keyLength = 32;
  const params = { passphrase, salt, iterations, keyLength };
  const digest = "sha512" as const;

  let derivedKey: Buffer | Uint8Array;

  switch (kdf) {
    case "pbkdf2": {
      derivedKey = getPBKDF2DerivedKey({ ...params, digest });

      break;
    }

    case "scrypt": {
      derivedKey = getScryptDerivedKey(params);

      break;
    }

    default:
      throw new Error("Invalid kdf");
  }

  // const cipher = "aes-128-ctr";
  // const derivedKey = await pbkdf2Async(passphrase, salt, kdfParams.c, kdfParams.dklen, "sha256");
  // const cipherIV = crypto.createCipheriv(cipher, derivedKey.subarray(0, 16), iv);
  // const ciphertext = Buffer.concat([
  //   cipherIV.update(Buffer.from(phrase, "utf8")),
  //   cipherIV.final(),
  // ]);
  // return {
  //   meta: "xchain-keystore",
  //   version: 1,
  //   crypto: {
  //     cipher,
  //     cipherparams: { iv: iv.toString("hex") },
  //     ciphertext: ciphertext.toString("hex"),
  //     kdf: "pbkdf2",
  //     kdfparams: kdfParams,
  //     mac: blake256(Buffer.concat([derivedKey.subarray(16, 32), Buffer.from(ciphertext)])),
  //   },
  // };
}

export function v2DecryptKeystore({
  keystore,
  passphrase,
}: { keystore: Keystores[KeystoreVersion.V2]; passphrase: string }) {
  const { kdf, cipher } = keystore.crypto;

  if (!["pbkdf2", "scrypt"].includes(kdf.function)) {
    throw new Error("Invalid kdf");
  }

  // const { kdfparams, cipher, cipherparams, ciphertext, mac } = keystore.crypto;
  // const { c, dklen, salt } = kdfparams;
  // const derivedKey = await pbkdf2Async(passphrase, Buffer.from(salt, "hex"), c, dklen, "sha256");
  // const computedCiphertext = Buffer.from(ciphertext, "hex");
  // const computedMac = blake256(Buffer.concat([derivedKey.subarray(16, 32), computedCiphertext]));
  // if (mac !== computedMac) throw new Error("Invalid passphrase");
  // const decipher = crypto.createDecipheriv(
  //   cipher,
  //   derivedKey.subarray(0, 16),
  //   Buffer.from(cipherparams.iv, "hex"),
  // );
  // const phrase = Buffer.concat([decipher.update(computedCiphertext), decipher.final()]);
  // return phrase.toString("utf8");
}
