import { toBech32 } from "@cosmjs/encoding";
import { base64, bech32 } from "@scure/base";

export const bech32ToBase64 = (address: string) =>
  base64.encode(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)));

export const base64ToBech32 = (address: string, prefix = "thor") =>
  toBech32(prefix, base64.decode(address));
