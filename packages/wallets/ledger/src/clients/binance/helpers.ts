const ab2hexstring = (arr: any) => {
  if (typeof arr !== "object") {
    throw new Error("ab2hexstring expects an array");
  }
  let result = "";

  for (const item of arr) {
    let str = item.toString(16);
    str = str.length === 0 ? "00" : str.length === 1 ? `0${str}` : str;
    result += str;
  }
  return result;
};

const sha256ripemd160 = async (hex: string) => {
  if (typeof hex !== "string") throw new Error("sha256ripemd160 expects a string");
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`);
  const { SHA256, enc, RIPEMD160 } = await import("crypto-js");

  const hexEncoded = enc.Hex.parse(hex);
  const ProgramSha256: any = SHA256(hexEncoded);
  return RIPEMD160(ProgramSha256).toString();
};

export const getAddressFromPublicKey = async (publicKeyHex: string, prefix: string) => {
  const { ec: EC } = await import("elliptic");
  const { bech32 } = await import("@scure/base");

  const ec = new EC("secp256k1");
  const pubKey = ec.keyFromPublic(publicKeyHex, "hex");
  const pubPoint = pubKey.getPublic();
  const compressed = pubPoint.encodeCompressed();
  const hexed = ab2hexstring(compressed);
  const hash = await sha256ripemd160(hexed); // https://git.io/fAn8N

  return bech32.encode(
    prefix,
    bech32.toWords(Buffer.isBuffer(hash) ? hash : Buffer.from(hash, "hex")),
  );
};
