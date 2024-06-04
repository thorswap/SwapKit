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

const updatedLastIndex = (path: DerivationPathArray, index: number) => [
  ...path.slice(0, path.length - 1),
  index,
];

export function getDerivationPathFor({ chain, index, addressIndex = 0, type }: Params) {
  if (EVMChains.includes(chain as EVMChain)) {
    if (type === "legacy") return [44, 60, 0, index];
    if (type === "ledgerLive") return [44, 60, index, 0, addressIndex];
    return updatedLastIndex(NetworkDerivationPath[chain], index);
  }

  if ([Chain.Bitcoin, Chain.Litecoin].includes(chain)) {
    const chainId = chain === Chain.Bitcoin ? 0 : 2;

    if (type === "nativeSegwitMiddleAccount") return [84, chainId, index, 0, addressIndex];
    if (type === "segwit") return [49, chainId, 0, 0, index];
    if (type === "legacy") return [44, chainId, 0, 0, index];
    return updatedLastIndex(NetworkDerivationPath[chain], index);
  }

  return updatedLastIndex(NetworkDerivationPath[chain], index);
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
