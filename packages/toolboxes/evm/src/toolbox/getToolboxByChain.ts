import { Chain } from "@swapkit/helpers";

import { ARBToolbox } from "./arb.ts";
import { AVAXToolbox } from "./avax.ts";
import { BASEToolbox } from "./base.ts";
import { BSCToolbox } from "./bsc.ts";
import { CROToolbox } from "./cro.ts";
import { ETHToolbox } from "./eth.ts";
import { FTMToolbox } from "./ftm.ts";
import { GNOToolbox } from "./gno.ts";
import { LINToolbox } from "./lin.ts";
import { MANTAToolbox } from "./manta.ts";
import { MATICToolbox } from "./matic.ts";
import { MNTToolbox } from "./mnt.ts";
import { MODEToolbox } from "./mode.ts";
import { OKTToolbox } from "./okt.ts";
import { OPToolbox } from "./op.ts";
import { PLSToolbox } from "./pls.ts";
import { TLOSToolbox } from "./tlos.ts";
import { ZKSToolbox } from "./zks.ts";

type ToolboxType = {
  ARB: typeof ARBToolbox;
  AVAX: typeof AVAXToolbox;
  BASE: typeof BASEToolbox;
  BSC: typeof BSCToolbox;
  CRO: typeof CROToolbox;
  ETH: typeof ETHToolbox;
  FTM: typeof FTMToolbox;
  GNO: typeof GNOToolbox;
  LIN: typeof LINToolbox;
  MANTA: typeof MANTAToolbox;
  MATIC: typeof MATICToolbox;
  MNT: typeof MNTToolbox;
  MODE: typeof MODEToolbox;
  OKT: typeof OKTToolbox;
  OP: typeof OPToolbox;
  PLS: typeof PLSToolbox;
  TLOS: typeof TLOSToolbox;
  ZKS: typeof ZKSToolbox;
};

export const getToolboxByChain = <T extends keyof ToolboxType>(chain: T): ToolboxType[T] => {
  switch (chain) {
    case Chain.Arbitrum:
      return ARBToolbox as ToolboxType[T];
    case Chain.Avalanche:
      return AVAXToolbox as ToolboxType[T];
    case Chain.Base:
      return BASEToolbox as ToolboxType[T];
    case Chain.BinanceSmartChain:
      return BSCToolbox as ToolboxType[T];
    case Chain.Cronos:
      return CROToolbox as ToolboxType[T];
    case Chain.Ethereum:
      return ETHToolbox as ToolboxType[T];
    case Chain.Fantom:
      return FTMToolbox as ToolboxType[T];
    case Chain.Gnosis:
      return GNOToolbox as ToolboxType[T];
    case Chain.Linea:
      return LINToolbox as ToolboxType[T];
    case Chain.Manta:
      return MANTAToolbox as ToolboxType[T];
    case Chain.Mantle:
      return MNTToolbox as ToolboxType[T];
    case Chain.Mode:
      return MODEToolbox as ToolboxType[T];
    case Chain.OKXChain:
      return OKTToolbox as ToolboxType[T];
    case Chain.Optimism:
      return OPToolbox as ToolboxType[T];
    case Chain.Polygon:
      return MATICToolbox as ToolboxType[T];
    case Chain.PulseChain:
      return PLSToolbox as ToolboxType[T];
    case Chain.Telos:
      return TLSToolbox as ToolboxType[T];
    case Chain.ZkSync:
      return ZKSToolbox as ToolboxType[T];
    default:
      throw new Error(`Chain ${chain} is not supported`);
  }
};
