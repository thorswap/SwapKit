import { entropyToMnemonic, generateMnemonic } from 'bip39';
import crypto from 'crypto';
import { blake256 } from 'foundry-primitives';
import { v4 as uuidv4 } from 'uuid';

const cipher = 'aes-128-ctr';
const kdf = 'pbkdf2';
const prf = 'hmac-sha256';
const dklen = 32;
const c = 262144;
const hashFunction = 'sha256';
const meta = 'xchain-keystore';

export type Keystore = {
  crypto: {
    cipher: string;
    ciphertext: string;
    cipherparams: {
      iv: string;
    };
    kdf: string;
    kdfparams: {
      prf: string;
      dklen: number;
      salt: string;
      c: number;
    };
    mac: string;
  };
  id: string;
  version: number;
  meta: string;
};

const pbkdf2Async = async (
  passphrase: string | Buffer | NodeJS.TypedArray | DataView,
  salt: string | Buffer | NodeJS.TypedArray | DataView,
  iterations: number,
  keylen: number,
  digest: string,
) => {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, iterations, keylen, digest, (err, drived) => {
      if (err) {
        reject(err);
      } else {
        resolve(drived);
      }
    });
  });
};

const _isNode = () => {
  return typeof window === 'undefined';
};

export const encryptToKeyStore = async (phrase: string, password: string) => {
  const ID = _isNode() ? require('uuid').v4() : uuidv4();
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const kdfParams = {
    prf,
    dklen,
    salt: salt.toString('hex'),
    c,
  };
  const cipherParams = {
    iv: iv.toString('hex'),
  };

  const derivedKey = await pbkdf2Async(
    Buffer.from(password),
    salt,
    kdfParams.c,
    kdfParams.dklen,
    hashFunction,
  );
  const cipherIV = crypto.createCipheriv(cipher, derivedKey.slice(0, 16), iv);
  const cipherText = Buffer.concat([
    cipherIV.update(Buffer.from(phrase, 'utf8')),
    cipherIV.final(),
  ]);
  const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(cipherText)]));

  const cryptoStruct = {
    cipher: cipher,
    ciphertext: cipherText.toString('hex'),
    cipherparams: cipherParams,
    kdf: kdf,
    kdfparams: kdfParams,
    mac: mac,
  };

  const keystore = {
    crypto: cryptoStruct,
    id: ID,
    version: 1,
    meta: meta,
  };

  return keystore;
};

export const generatePhrase = (size = 12) => {
  const entropy = size === 12 ? 128 : 256;
  if (_isNode()) {
    return entropyToMnemonic(crypto.randomBytes(entropy / 8));
  } else {
    return generateMnemonic(entropy);
  }
};

export const decryptFromKeystore = async (keystore: Keystore, password: string) => {
  const kdfparams = keystore.crypto.kdfparams;
  const derivedKey = await pbkdf2Async(
    Buffer.from(password),
    Buffer.from(kdfparams.salt, 'hex'),
    kdfparams.c,
    kdfparams.dklen,
    hashFunction,
  );

  const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex');
  const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));

  if (mac !== keystore.crypto.mac) throw new Error('Invalid password');
  const decipher = crypto.createDecipheriv(
    keystore.crypto.cipher,
    derivedKey.slice(0, 16),
    Buffer.from(keystore.crypto.cipherparams.iv, 'hex'),
  );

  const phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return phrase.toString('utf8');
};
