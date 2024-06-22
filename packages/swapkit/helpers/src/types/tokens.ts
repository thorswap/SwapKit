import type {
  ChainflipList,
  MayaList,
  OneInchList,
  PancakeswapList,
  PangolinList,
  SushiswapList,
  ThorchainList,
  TraderjoeV1List,
  TraderjoeV2List,
  UniswapV2List,
  UniswapV3List,
} from "@swapkit/tokens";

export type TokenTax = { buy: number; sell: number };

export type TokenNames =
  | (typeof ChainflipList)["tokens"][number]["identifier"]
  | (typeof MayaList)["tokens"][number]["identifier"]
  | (typeof OneInchList)["tokens"][number]["identifier"]
  | (typeof PancakeswapList)["tokens"][number]["identifier"]
  | (typeof PangolinList)["tokens"][number]["identifier"]
  | (typeof SushiswapList)["tokens"][number]["identifier"]
  | (typeof ThorchainList)["tokens"][number]["identifier"]
  | (typeof TraderjoeV1List)["tokens"][number]["identifier"]
  | (typeof TraderjoeV2List)["tokens"][number]["identifier"]
  | (typeof UniswapV2List)["tokens"][number]["identifier"]
  | (typeof UniswapV3List)["tokens"][number]["identifier"];
//   | (typeof CoinGeckoList)["tokens"][number]["identifier"]
//   | (typeof PancakeswapETHList)["tokens"][number]["identifier"]
//   | (typeof StargateARBList)["tokens"][number]["identifier"]
//   | (typeof TraderjoeList)["tokens"][number]["identifier"]
//   | (typeof WoofiList)["tokens"][number]["identifier"]
//   | (typeof UniswapList)["tokens"][number]["identifier"];
