import crypto from "crypto";
import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { blake2bFinal, blake2bInit, blake2bUpdate } from "blakejs";

/**
 * taken from `foundry-primitives` and modified
 */
export const blake256 = (initData: Buffer | string): string => {
  let data = initData;

  if (!(data instanceof Buffer)) {
    data = Buffer.from(data, "hex");
  }

  const context = blake2bInit(32);
  blake2bUpdate(context, data);

  return Array.from(blake2bFinal(context))
    .map((byte) => (byte < 0x10 ? `0${byte.toString(16)}` : byte.toString(16)))
    .join("");
};

export const pbkdf2Async = (
  passphrase: string,
  salt: Buffer,
  iterations: number,
  keylen: number,
  digest: string,
) =>
  new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(Buffer.from(passphrase), salt, iterations, keylen, digest, (error, derived) => {
      if (error) {
        reject(error);
      } else {
        resolve(derived);
      }
    });
  });

export const generatePhrase = (size: 12 | 24 = 12) => {
  return generateMnemonic(wordlist, size === 12 ? 128 : 256);
};

export const validatePhrase = (phrase: string) => {
  return validateMnemonic(phrase, wordlist);
};
