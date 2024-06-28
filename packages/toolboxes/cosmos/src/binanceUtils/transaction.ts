import * as secp256k1 from "@bitcoinerlab/secp256k1";
import { SHA256, enc } from "crypto-js";
import { type curve, ec } from "elliptic";
import { convertObjectToSignBytes, encodeBinaryByteArray, marshalBinary } from "./amino/encoder.ts";
import { UVarInt } from "./amino/varint.ts";
import type { BaseMsg, StdSignMsg, StdSignature, StdTx } from "./types.ts";
import { AminoPrefix } from "./types.ts";

const sha256 = (hex: string) => {
  if (typeof hex !== "string") throw new Error("sha256 expects a hex string");
  if (hex.length % 2 !== 0) throw new Error(`invalid hex string length: ${hex}`);
  const hexEncoded = enc.Hex.parse(hex);
  return SHA256(hexEncoded).toString();
};

const generatePubKey = (privateKey: Buffer) => {
  const curve = new ec("secp256k1");
  const keypair = curve.keyFromPrivate(privateKey);
  return keypair.getPublic();
};

const generateSignature = (signBytesHex: string, privateKey: string | Buffer) => {
  const msgHash = sha256(signBytesHex);
  const msgHashHex = Buffer.from(msgHash, "hex");
  const signature = secp256k1.sign(
    msgHashHex,
    typeof privateKey === "string" ? Buffer.from(privateKey, "hex") : privateKey,
  );
  return Buffer.from(signature);
};

/**
 * Creates a new transaction object.
 * @example
 * var rawTx = {
 *   accountNumber: 1,
 *   chainId: 'bnbchain-1000',
 *   memo: '',
 *   msg: {},
 *   type: 'NewOrderMsg',
 *   sequence: 29,
 *   source: 0
 * };
 * var tx = new Transaction(rawTx);
 * @property {Buffer} raw The raw vstruct encoded transaction
 * @param {Number} data.account_number account number
 * @param {String} data.chain_id bnbChain Id
 * @param {String} data.memo transaction memo
 * @param {String} type transaction type
 * @param {Msg} data.msg object data of tx type
 * @param {Number} data.sequence transaction counts
 * @param {Number} data.source where does this transaction come from
 */

export class BNBTransaction {
  public sequence: NonNullable<StdSignMsg["sequence"]>;
  public accountNumber: NonNullable<StdSignMsg["accountNumber"]>;
  public chainId: StdSignMsg["chainId"];

  // DEPRECATED: Retained for backward compatibility,
  public msg?: NotWorth;

  public baseMsg?: NonNullable<BaseMsg>;
  public memo: StdSignMsg["memo"];
  public source: NonNullable<StdSignMsg["source"]>;
  public signatures: StdSignature[];

  constructor(initData: StdSignMsg) {
    const data = initData || {};
    if (!data.chainId) {
      throw new Error("chain id should not be null");
    }

    this.sequence = data.sequence || 0;
    this.accountNumber = data.accountNumber || 0;
    this.chainId = data.chainId;
    this.msg = data.msg;
    this.baseMsg = data.baseMsg;
    this.memo = data.memo;
    this.source = data.source || 0; // default value is 0
    this.signatures = [];
  }

  /**
   * generate the sign bytes for a transaction, given a msg
   * @param {SignMsg} concrete msg object
   * @return {Buffer}
   **/
  getSignBytes(initMsg?: NotWorth): Buffer {
    const msg = initMsg || this.baseMsg?.getSignMsg?.();
    const signMsg = {
      account_number: this.accountNumber.toString(),
      chain_id: this.chainId,
      data: null,
      memo: this.memo,
      msgs: [msg],
      sequence: this.sequence.toString(),
      source: this.source.toString(),
    };
    return convertObjectToSignBytes(signMsg);
  }

  /**
   * attaches a signature to the transaction
   * @param {Elliptic.PublicKey} pubKey
   * @param {Buffer} signature
   * @return {Transaction}
   **/
  addSignature(pubKey: curve.base.BasePoint, signature: Buffer) {
    const pubKeyBuf = this._serializePubKey(pubKey); // => Buffer
    this.signatures = [
      {
        pub_key: pubKeyBuf,
        signature: signature,
        account_number: this.accountNumber,
        sequence: this.sequence,
      },
    ];
    return this;
  }

  /**
   * sign transaction with a given private key and msg
   * @param {string} privateKey private key hex string
   * @param {SignMsg} concrete msg object
   * @return {Transaction}
   **/
  sign = async (privateKey: string, msg?: NotWorth) => {
    if (!privateKey) {
      throw new Error("private key should not be null");
    }

    const signBytes = this.getSignBytes(msg);
    const privKeyBuf = Buffer.from(privateKey, "hex");
    const signature = await generateSignature(signBytes.toString("hex"), privKeyBuf);
    const pubKey = await generatePubKey(privKeyBuf);

    this.addSignature(pubKey, signature);
    return this;
  };

  /**
   * encode signed transaction to hex which is compatible with amino
   */
  serialize(): string {
    if (!this.signatures) {
      throw new Error("need signature");
    }
    const msg = this.msg || this.baseMsg?.getMsg?.();
    const stdTx: StdTx = {
      msg: [msg],
      signatures: this.signatures,
      memo: this.memo,
      source: this.source, // sdk value is 0, web wallet value is 1
      data: "",
      aminoPrefix: AminoPrefix.StdTx,
    };
    const bytes = marshalBinary(stdTx);
    return bytes.toString("hex");
  }

  /**
   * serializes a public key in a 33-byte compressed format.
   * @param {Elliptic.PublicKey} unencodedPubKey
   * @return {Buffer}
   */
  _serializePubKey(unencodedPubKey: curve.base.BasePoint) {
    let format = 0x2;
    const y = unencodedPubKey.getY();
    const x = unencodedPubKey.getX();
    if (y?.isOdd()) {
      format |= 0x1;
    }
    let pubBz = Buffer.concat([UVarInt.encode(format), x.toArrayLike(Buffer, "be", 32)]);

    // prefixed with length
    pubBz = encodeBinaryByteArray(pubBz);
    // add the amino prefix
    pubBz = Buffer.concat([Buffer.from("EB5AE987", "hex"), pubBz]);
    return pubBz;
  }
}
