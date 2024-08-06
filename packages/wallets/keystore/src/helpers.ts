import { generateMnemonic, validateMnemonic } from "ethereum-cryptography/bip39";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english";
import { blake2b } from "ethereum-cryptography/blake2b";
import { pbkdf2Sync } from "ethereum-cryptography/pbkdf2";
import { scryptSync } from "ethereum-cryptography/scrypt";
import { utf8ToBytes } from "ethereum-cryptography/utils";

export const blake256 = (initData: Buffer | string): string => {
  let data = initData;

  if (!(data instanceof Buffer)) {
    data = Buffer.from(data, "hex");
  }

  const blake2bHash = blake2b(data, 32);

  return Array.from(blake2bHash)
    .map((byte) => (byte < 0x10 ? `0${byte.toString(16)}` : byte.toString(16)))
    .join("");
};

export const getPBKDF2DerivedKey = ({
  passphrase,
  salt,
  iterations,
  keyLength,
  digest = "sha256",
}: {
  passphrase: string;
  salt: Buffer | Uint8Array | string;
  iterations: number;
  keyLength: number;
  digest: "sha256" | "sha512";
}) => {
  const saltBuffer = typeof salt === "string" ? Buffer.from(salt, "hex") : salt;

  return pbkdf2Sync(utf8ToBytes(passphrase), saltBuffer, iterations, keyLength, digest);
};

export const getScryptDerivedKey = ({
  passphrase,
  salt,
  iterations,
  keyLength,
  progressCallback = console.info,
}: {
  passphrase: string;
  salt: Uint8Array;
  iterations: number;
  keyLength: number;
  progressCallback?: (progress: number) => void;
}) => {
  return scryptSync(utf8ToBytes(passphrase), salt, iterations, 8, 1, keyLength, progressCallback);
};

export const generatePhrase = (size: 12 | 24 = 12) => {
  return generateMnemonic(wordlist, size === 12 ? 128 : 256);
};

export const validatePhrase = (phrase: string) => {
  return validateMnemonic(phrase, wordlist);
};
