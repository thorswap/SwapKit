import type {
  ChainflipList,
  CoinGeckoList,
  MayaList,
  PancakeswapETHList,
  PancakeswapList,
  PangolinList,
  StargateARBList,
  SushiswapList,
  ThorchainList,
  TraderjoeList,
  UniswapList,
  WoofiList,
} from "@swapkit/tokens";

export type TokenTax = { buy: number; sell: number };

export type TokenNames =
  | (typeof ThorchainList)["tokens"][number]["identifier"]
  | (typeof CoinGeckoList)["tokens"][number]["identifier"]
  | (typeof MayaList)["tokens"][number]["identifier"]
  | (typeof PancakeswapETHList)["tokens"][number]["identifier"]
  | (typeof PancakeswapList)["tokens"][number]["identifier"]
  | (typeof PangolinList)["tokens"][number]["identifier"]
  | (typeof StargateARBList)["tokens"][number]["identifier"]
  | (typeof SushiswapList)["tokens"][number]["identifier"]
  | (typeof TraderjoeList)["tokens"][number]["identifier"]
  | (typeof WoofiList)["tokens"][number]["identifier"]
  | (typeof UniswapList)["tokens"][number]["identifier"]
  | (typeof ChainflipList)["tokens"][number]["identifier"];
