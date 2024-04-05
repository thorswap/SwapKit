import { BN } from "bn.js";

function VarIntFunc(signed: boolean) {
  const encodingLength = (initN: number) => {
    let n = initN;

    if (signed) n *= 2;
    if (n < 0) {
      throw Error("varint value is out of bounds");
    }
    const bits = Math.log2(n + 1);
    return Math.ceil(bits / 7) || 1;
  };

  const encode = (n: number, initBuffer?: Buffer, initOffset?: number) => {
    if (n < 0) {
      throw Error("varint value is out of bounds");
    }

    const buffer = initBuffer || Buffer.alloc(encodingLength(n));
    const offset = initOffset || 0;
    const nStr = n.toString();
    // TODO: rewrite to SwapKitNumber to avoid bn.js
    let bn = new BN(nStr, 10);
    const num255 = new BN(0xff);
    const num128 = new BN(0x80);

    // amino signed varint is multiplied by 2
    if (signed) {
      bn = bn.muln(2);
    }

    let i = 0;
    while (bn.gten(0x80)) {
      buffer[offset + i] = bn.and(num255).or(num128).toNumber();
      bn = bn.shrn(7);
      i++;
    }

    // @ts-expect-error - bn is fine ¯\_(ツ)_/¯
    buffer[offset + i] = bn.andln(0xff);

    return buffer;
  };

  /**
   * https://github.com/golang/go/blob/master/src/encoding/binary/varint.go#L60
   */
  const decode = (bytes: Buffer) => {
    let x = 0;
    let s = 0;
    for (let i = 0, len = bytes.length; i < len; i++) {
      const b = bytes[i] as number;

      if (b < 0x80) {
        if (i > 9 || (i === 9 && b > 1)) {
          return 0;
        }
        return x | (b << s);
      }
      x |= (b & 0x7f) << s;
      s += 7;
    }

    return 0;
  };

  return { encode, decode, encodingLength };
}

export const UVarInt = VarIntFunc(false);
export const VarInt = VarIntFunc(true);
