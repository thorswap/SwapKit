import {
  AssetValue,
  BaseDecimal,
  type EVMChain,
  FeeOption,
  SwapKitNumber,
  filterAssets,
  formatBigIntToSafeValue,
  isGasAsset,
} from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider } from "ethers";

import type { CovalentApiType, EVMMaxSendableAmountsParams, EthplorerApiType } from "./index.ts";

export const estimateMaxSendableAmount = async ({
  toolbox,
  from,
  memo = "",
  feeOptionKey = FeeOption.Fastest,
  assetValue,
  abi,
  funcName,
  funcParams,
  contractAddress,
  txOverrides,
}: EVMMaxSendableAmountsParams): Promise<AssetValue> => {
  const balance = (await toolbox.getBalance(from)).find(({ symbol, chain }) =>
    assetValue
      ? symbol === assetValue.symbol
      : symbol === AssetValue.fromChainOrSignature(chain)?.symbol,
  );

  const gasRate = (await toolbox.estimateGasPrices())[feeOptionKey];

  if (!balance) return AssetValue.fromChainOrSignature(assetValue.chain, 0);

  if (assetValue && (balance.chain !== assetValue.chain || balance.symbol !== assetValue?.symbol)) {
    return balance;
  }

  const gasLimit =
    abi && funcName && funcParams && contractAddress
      ? await toolbox.estimateCall({
          contractAddress,
          abi,
          funcName,
          funcParams,
          txOverrides,
        })
      : await toolbox.estimateGasLimit({
          from,
          recipient: from,
          memo,
          assetValue,
        });

  const isFeeEIP1559Compatible = "maxFeePerGas" in gasRate;
  const isFeeEVMLegacyCompatible = "gasPrice" in gasRate;

  if (!(isFeeEVMLegacyCompatible || isFeeEIP1559Compatible)) {
    throw new Error("Could not fetch fee data");
  }

  const fee =
    gasLimit *
    (isFeeEIP1559Compatible
      ? (gasRate.maxFeePerGas || 1n) + (gasRate.maxPriorityFeePerGas || 1n)
      : gasRate.gasPrice);
  const maxSendableAmount = SwapKitNumber.fromBigInt(balance.getBaseValue("bigint")).sub(
    fee.toString(),
  );

  return AssetValue.fromChainOrSignature(balance.chain, maxSendableAmount.getValue("string"));
};

export const toHexString = (value: bigint) => (value > 0n ? `0x${value.toString(16)}` : "0x0");

export const getBalance = async ({
  provider,
  api,
  address,
  chain,
  potentialScamFilter,
}: {
  provider: JsonRpcProvider | BrowserProvider;
  api: CovalentApiType | EthplorerApiType;
  address: string;
  chain: EVMChain;
  potentialScamFilter?: boolean;
}) => {
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);
  const balances = [
    {
      chain,
      symbol: AssetValue.fromChainOrSignature(chain).symbol,
      value: formatBigIntToSafeValue({
        value: BigInt(evmGasTokenBalance),
        decimal: 18,
        bigIntDecimal: 18,
      }),
      decimal: BaseDecimal[chain],
    },
    ...tokenBalances.filter((token) => !isGasAsset(token)),
  ];

  const filteredBalances = potentialScamFilter ? filterAssets(balances) : balances;

  return filteredBalances.map(
    ({ symbol, value, decimal }) =>
      new AssetValue({
        decimal: decimal || BaseDecimal[chain],
        value,
        identifier: `${chain}.${symbol}`,
      }),
  );
};
