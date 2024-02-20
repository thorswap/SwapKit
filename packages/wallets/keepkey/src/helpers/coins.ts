/*
    KeepKey Specific bip32 path conventions
*/

const HARDENED = 0x80000000;

export enum ChainToKeepKeyName {
  BTC = "Bitcoin",
  BCH = "BitcoinCash",
  DOGE = "Dogecoin",
  LTC = "Litecoin",
  DASH = "Dash",
}

export function addressNListToBIP32(address: number[]) {
  return `m/${address.map((num) => (num >= HARDENED ? `${num - HARDENED}'` : num)).join("/")}`;
}

export function bip32Like(path: string) {
  if (path === "m/") return true;

  return /^m(((\/[0-9]+h)+|(\/[0-9]+H)+|(\/[0-9]+')*)((\/[0-9]+)*))$/.test(path);
}

export function bip32ToAddressNList(initPath: string): number[] {
  let path = initPath;

  if (!bip32Like(path)) {
    throw new Error(`Not a bip32 path: '${path}'`);
  }

  if (/^m\//i.test(path)) {
    path = path.slice(2);
  }
  const segments = path.split("/");

  if (segments.length === 1 && segments[0] === "") return [];

  const ret = new Array(segments.length);

  for (let i = 0; i < segments.length; i++) {
    // TODO: Check for better way instead of exec
    const tmp = /(\d+)([hH']?)/.exec(segments[i]);

    if (tmp === null) throw new Error("Invalid input");

    ret[i] = parseInt(tmp[1], 10);

    if (ret[i] >= HARDENED) throw new Error("Invalid child index");

    if (tmp[2] === "h" || tmp[2] === "H" || tmp[2] === "'") {
      ret[i] += HARDENED;
    } else if (tmp[2].length !== 0) {
      throw new Error("Invalid modifier");
    }
  }

  return ret;
}
