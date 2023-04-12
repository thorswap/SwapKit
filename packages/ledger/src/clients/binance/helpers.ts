import { bech32 } from 'bech32';
import { enc, RIPEMD160, SHA256 } from 'crypto-js';
import { ec as EC } from 'elliptic';

const encodeAddress = (
  value: string | Buffer,
  prefix = 'tbnb',
  type: BufferEncoding = 'hex',
): string => {
  const words = bech32.toWords(Buffer.isBuffer(value) ? value : Buffer.from(value, type));

  return bech32.encode(prefix, words);
};

const ab2hexstring = (arr: any) => {
  if (typeof arr !== 'object') {
    throw new Error('ab2hexstring expects an array');
  }
  let result = '';
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16);
    str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str;
    result += str;
  }
  return result;
};

const sha256ripemd160 = (hex: string) => {
  if (typeof hex !== 'string') throw new Error('sha256ripemd160 expects a string');
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`);
  const hexEncoded = enc.Hex.parse(hex);
  const ProgramSha256: any = SHA256(hexEncoded);
  return RIPEMD160(ProgramSha256).toString();
};

export const getAddressFromPublicKey = (publicKeyHex: string, prefix?: string) => {
  const ec = new EC('secp256k1');
  const pubKey = ec.keyFromPublic(publicKeyHex, 'hex');
  const pubPoint = pubKey.getPublic();
  const compressed = pubPoint.encodeCompressed();
  const hexed = ab2hexstring(compressed);
  const hash = sha256ripemd160(hexed); // https://git.io/fAn8N
  return encodeAddress(hash, prefix);
};

export const getPublicKey = (publicKey: string) => {
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.getPublic();
};
