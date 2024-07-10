import {
  Chain,
  type DerivationPathArray,
  type EVMChain,
  EVMChains,
  NetworkDerivationPath,
} from "../types";

type Params = {
  chain: Chain;
  index: number;
  addressIndex?: number;
  type?: "legacy" | "ledgerLive" | "nativeSegwitMiddleAccount" | "segwit";
};

const updatedLastIndex = (path: DerivationPathArray, index: number) => {
  const newPath = [...path.slice(0, path.length - 1), index];
  return newPath as DerivationPathArray;
};

export function getDerivationPathFor({ chain, index, addressIndex = 0, type }: Params) {
  if (EVMChains.includes(chain as EVMChain)) {
    if (type === "legacy") return [44, 60, 0, index] as DerivationPathArray;
    if (type === "ledgerLive") return [44, 60, index, 0, addressIndex] as DerivationPathArray;
    return updatedLastIndex(NetworkDerivationPath[chain], index);
  }

  const chainId = chain === Chain.Litecoin ? 2 : 0;

  switch (type) {
    case "nativeSegwitMiddleAccount":
      return [84, chainId, index, 0, addressIndex] as DerivationPathArray;
    case "segwit":
      return [49, chainId, 0, 0, index] as DerivationPathArray;
    case "legacy":
      return [44, chainId, 0, 0, index] as DerivationPathArray;
    default:
      return updatedLastIndex(NetworkDerivationPath[chain], index);
  }
}

export function getWalletFormatFor(path: string) {
  const [_, purpose, chainId] = path.split("/").map((p) => Number.parseInt(p, 10));

  if (chainId === 145) "cashaddr";

  switch (purpose) {
    case 44:
      return "legacy";
    case 49:
      return "p2sh";
    default:
      return "bech32";
  }
}
