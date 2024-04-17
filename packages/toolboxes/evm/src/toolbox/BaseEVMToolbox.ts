import {
  type Asset,
  type AssetValue,
  Chain,
  ContractAddress,
  type EVMChain,
  FeeOption,
  SwapKitNumber,
  type WalletTxParams,
  erc20ABI,
  isGasAsset,
} from "@swapkit/helpers";
import type {
  ContractTransaction,
  Fragment,
  HDNodeWallet,
  JsonFragment,
  JsonRpcSigner,
  Provider,
  Signer,
} from "ethers";
import { BrowserProvider, Contract, Interface, hexlify, toUtf8Bytes } from "ethers";
import { getAddress } from "ethers/address";
import { MaxInt256 } from "ethers/constants";

import { toHexString } from "../index.ts";
import type {
  ApproveParams,
  ApprovedParams,
  CallParams,
  EIP1559TxParams,
  EVMTxParams,
  EstimateCallParams,
  IsApprovedParams,
  LegacyEVMTxParams,
  TransferParams,
} from "../types/clientTypes.ts";

export const MAX_APPROVAL = MaxInt256;

const baseAssetAddress: Record<EVMChain, string> = {
  [Chain.Arbitrum]: ContractAddress.ARB,
  [Chain.Ethereum]: ContractAddress.ETH,
  [Chain.Avalanche]: ContractAddress.AVAX,
  [Chain.BinanceSmartChain]: ContractAddress.BSC,
  [Chain.Polygon]: ContractAddress.MATIC,
  [Chain.Optimism]: ContractAddress.OP,
};

const stateMutable = ["payable", "nonpayable"];
// const nonStateMutable = ['view', 'pure'];

const isEIP1559Transaction = (tx: EVMTxParams) =>
  (tx as EIP1559TxParams).type === 2 ||
  !!(tx as EIP1559TxParams).maxFeePerGas ||
  !!(tx as EIP1559TxParams).maxPriorityFeePerGas;

export const isBrowserProvider = (provider: Todo) => provider instanceof BrowserProvider;
export const createContract = (
  address: string,
  abi: readonly (JsonFragment | Fragment)[],
  provider: Provider,
) => {
  return new Contract(address, Interface.from(abi), provider);
};

const validateAddress = (address: string) => {
  try {
    getAddress(address);
    return true;
  } catch (_error) {
    return false;
  }
};

export const isStateChangingCall = (abi: readonly JsonFragment[], functionName: string) => {
  const abiFragment = abi.find((fragment: Todo) => fragment.name === functionName) as Todo;
  if (!abiFragment) throw new Error(`No ABI fragment found for function ${functionName}`);
  return abiFragment.stateMutability && stateMutable.includes(abiFragment.stateMutability);
};

export type WithSigner<T> = T & { signer?: Signer };

/**
 * @info call contract function
 * When using this method to make a non state changing call to the blockchain, like a isApproved call,
 * the signer needs to be set to undefined
 */
const call = async <T>(
  provider: Provider,
  isEIP1559Compatible: boolean,
  {
    callProvider,
    signer,
    contractAddress,
    abi,
    funcName,
    funcParams = [],
    txOverrides,
    feeOption = FeeOption.Fast,
  }: WithSigner<CallParams>,
): Promise<T> => {
  const contractProvider = callProvider || provider;
  if (!contractAddress) throw new Error("contractAddress must be provided");

  const isStateChanging = isStateChangingCall(abi, funcName);

  if (isStateChanging && isBrowserProvider(contractProvider) && signer) {
    const txObject = await createContractTxObject(contractProvider, {
      contractAddress,
      abi,
      funcName,
      funcParams,
      txOverrides,
    });

    return EIP1193SendTransaction(contractProvider, txObject) as Promise<T>;
  }
  const contract = createContract(contractAddress, abi, contractProvider);

  // only use signer if the contract function is state changing
  if (isStateChanging) {
    if (!signer) throw new Error("Signer is not defined");

    const address = txOverrides?.from || (await signer.getAddress());

    if (!address) throw new Error("No signer address found");

    const connectedContract = contract.connect(signer);
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = (
      await estimateGasPrices(provider, isEIP1559Compatible)
    )[feeOption];

    const gasLimit = await contract.getFunction(funcName).estimateGas(...funcParams, txOverrides);

    // @ts-expect-error
    const result = await connectedContract[funcName](...funcParams, {
      ...txOverrides,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      /**
       * nonce must be set due to a possible bug with ethers.js,
       * expecting a synchronous nonce while the JsonRpcProvider delivers Promise
       */
      nonce: txOverrides?.nonce || (await contractProvider.getTransactionCount(address)),
    });

    return typeof result?.hash === "string" ? result?.hash : result;
  }

  const result = await contract[funcName]?.(...funcParams);

  return typeof result?.hash === "string" ? result?.hash : result;
};

export const createContractTxObject = async (
  provider: Provider,
  { contractAddress, abi, funcName, funcParams = [], txOverrides }: CallParams,
) =>
  createContract(contractAddress, abi, provider)
    .getFunction(funcName)
    .populateTransaction(...funcParams.concat(txOverrides).filter((p) => typeof p !== "undefined"));

const approvedAmount = async (
  provider: Provider,
  { assetAddress, spenderAddress, from }: IsApprovedParams,
) =>
  await call<bigint>(provider, true, {
    contractAddress: assetAddress,
    abi: erc20ABI as Todo,
    funcName: "allowance",
    funcParams: [from, spenderAddress],
  });

const isApproved = async (
  provider: Provider,
  { assetAddress, spenderAddress, from, amount = MAX_APPROVAL }: IsApprovedParams,
) => {
  return SwapKitNumber.fromBigInt(
    await approvedAmount(provider, { assetAddress, spenderAddress, from }),
  ).gte(SwapKitNumber.fromBigInt(BigInt(amount)));
};

const approve = async (
  provider: Provider,
  {
    assetAddress,
    spenderAddress,
    feeOptionKey = FeeOption.Fast,
    amount,
    gasLimitFallback,
    from,
    nonce,
  }: ApproveParams,
  signer?: Signer,
  isEIP1559Compatible = true,
) => {
  const funcParams = [spenderAddress, BigInt(amount || MAX_APPROVAL)];
  const txOverrides = { from };

  const functionCallParams = {
    contractAddress: assetAddress,
    abi: erc20ABI,
    funcName: "approve",
    funcParams,
    signer,
    txOverrides,
  };

  if (isBrowserProvider(provider)) {
    return EIP1193SendTransaction(
      provider,
      await createContractTxObject(provider, functionCallParams),
    );
  }

  return call<string>(provider, isEIP1559Compatible, {
    ...functionCallParams,
    funcParams,
    txOverrides: {
      from,
      nonce,
      gasLimit: gasLimitFallback ? BigInt(gasLimitFallback.toString()) : undefined,
    },
    feeOption: feeOptionKey,
  });
};

// TODO - get from from signer or make it mandatory
const transfer = (
  provider: Provider | BrowserProvider,
  {
    assetValue,
    memo,
    recipient,
    feeOptionKey = FeeOption.Fast,
    data,
    from,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    ...tx
  }: TransferParams,
  signer?: Signer,
  isEIP1559Compatible = true,
) => {
  const txAmount = assetValue.getBaseValue("bigint");
  const chain = assetValue.chain as EVMChain;

  if (!isGasAsset(assetValue)) {
    const contractAddress = getTokenAddress(assetValue, chain);
    if (!contractAddress) throw new Error("No contract address found");

    // Transfer ERC20
    return call<string>(provider, isEIP1559Compatible, {
      signer,
      contractAddress,
      abi: erc20ABI,
      funcName: "transfer",
      funcParams: [recipient, txAmount],
      txOverrides: { from, maxFeePerGas, maxPriorityFeePerGas, gasPrice },
      feeOption: feeOptionKey,
    });
  }

  // Transfer ETH
  const txObject = {
    ...tx,
    from,
    to: recipient,
    value: txAmount,
    data: data || hexlify(toUtf8Bytes(memo || "")),
  };

  return sendTransaction(provider, txObject, feeOptionKey, signer, isEIP1559Compatible);
};

const estimateGasPrices = async (provider: Provider, isEIP1559Compatible = true) => {
  try {
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider.getFeeData();

    if (isEIP1559Compatible) {
      if (!(maxFeePerGas && maxPriorityFeePerGas)) throw new Error("No fee data available");

      return {
        [FeeOption.Average]: { maxFeePerGas, maxPriorityFeePerGas },
        [FeeOption.Fast]: {
          maxFeePerGas: (maxFeePerGas * 15n) / 10n,
          maxPriorityFeePerGas: (maxPriorityFeePerGas * 15n) / 10n,
        },
        [FeeOption.Fastest]: {
          maxFeePerGas: maxFeePerGas * 2n,
          maxPriorityFeePerGas: maxPriorityFeePerGas * 2n,
        },
      };
    }
    if (!gasPrice) throw new Error("No fee data available");

    return {
      [FeeOption.Average]: { gasPrice },
      [FeeOption.Fast]: { gasPrice: (gasPrice * 15n) / 10n },
      [FeeOption.Fastest]: { gasPrice: gasPrice * 2n },
    };
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as Todo).msg ?? (error as Todo).toString()}`,
    );
  }
};

const estimateCall = (
  provider: Provider,
  {
    signer,
    contractAddress,
    abi,
    funcName,
    funcParams = [],
    txOverrides,
  }: WithSigner<EstimateCallParams>,
) => {
  if (!contractAddress) throw new Error("contractAddress must be provided");

  const contract = createContract(contractAddress, abi, provider);
  return signer
    ? contract
        .connect(signer)
        .getFunction(funcName)
        .estimateGas(...funcParams, txOverrides)
    : contract.getFunction(funcName).estimateGas(...funcParams, txOverrides);
};

const estimateGasLimit = (
  provider: Provider,
  {
    assetValue,
    recipient,
    memo,
    from,
    funcName,
    funcParams,
    txOverrides,
    signer,
  }: WalletTxParams & {
    assetValue: AssetValue;
    funcName?: string;
    funcParams?: unknown[];
    signer?: Signer;
    txOverrides?: EVMTxParams;
  },
) => {
  const value = assetValue.bigIntValue;
  const assetAddress = isGasAsset({ ...assetValue })
    ? null
    : getTokenAddress(assetValue, assetValue.chain as EVMChain);

  if (assetAddress && funcName) {
    // ERC20 gas estimate
    return estimateCall(provider, {
      contractAddress: assetAddress,
      abi: erc20ABI,
      funcName,
      funcParams,
      txOverrides,
      signer,
    });
  }

  return provider.estimateGas({
    from,
    to: recipient,
    value,
    data: memo ? hexlify(toUtf8Bytes(memo)) : undefined,
  });
};

const sendTransaction = async (
  provider: Provider | BrowserProvider,
  tx: EVMTxParams,
  feeOptionKey: FeeOption = FeeOption.Fast,
  signer?: Signer,
  isEIP1559Compatible = true,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: refactor
) => {
  if (!signer) throw new Error("Signer is not defined");
  const { from, to, data, value, ...transaction } = tx;
  if (!to) throw new Error("No to address provided");

  const parsedTxObject = {
    ...transaction,
    data: data || "0x",
    to,
    from,
    value: BigInt(value || 0),
  };

  // early return to skip gas estimation if provider is EIP-1193
  if (isBrowserProvider(provider)) {
    return EIP1193SendTransaction(provider, parsedTxObject);
  }

  const address = from || (await signer.getAddress());
  const nonce = tx.nonce || (await provider.getTransactionCount(address));
  const chainId = (await provider.getNetwork()).chainId;

  const isEIP1559 = isEIP1559Transaction(parsedTxObject) || isEIP1559Compatible;

  const feeData =
    (isEIP1559 &&
      !(
        (parsedTxObject as EIP1559TxParams).maxFeePerGas &&
        (parsedTxObject as EIP1559TxParams).maxPriorityFeePerGas
      )) ||
    !(parsedTxObject as LegacyEVMTxParams).gasPrice
      ? Object.entries(
          (await estimateGasPrices(provider, isEIP1559Compatible))[feeOptionKey],
        ).reduce(
          // biome-ignore lint/performance/noAccumulatingSpread: this is a small object
          (acc, [k, v]) => ({ ...acc, [k]: toHexString(BigInt(v)) }),
          {} as {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
            gasPrice?: string;
          },
        )
      : {};
  let gasLimit: string;
  try {
    gasLimit = toHexString(
      parsedTxObject.gasLimit || ((await provider.estimateGas(parsedTxObject)) * 11n) / 10n,
    );
  } catch (error) {
    throw new Error(`Error estimating gas limit: ${JSON.stringify(error)}`);
  }

  try {
    const txObject = {
      ...parsedTxObject,
      chainId,
      type: isEIP1559 ? 2 : 0,
      gasLimit,
      nonce,
      ...feeData,
    };

    try {
      const response = await signer.sendTransaction(txObject);
      return typeof response?.hash === "string" ? response.hash : response;
    } catch (_error) {
      const txHex = await signer.signTransaction({
        ...txObject,
        from: address,
      });
      const response = await provider.broadcastTransaction(txHex);
      return typeof response?.hash === "string" ? response.hash : response;
    }
  } catch (error) {
    throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
  }
};

/**
 * Exported helper functions
 */
export const toChecksumAddress = (address: string) => getAddress(address);

export const EIP1193SendTransaction = (
  provider: Provider | BrowserProvider,
  { from, to, data, value }: EVMTxParams | ContractTransaction,
): Promise<string> => {
  if (!isBrowserProvider(provider)) throw new Error("Provider is not EIP-1193 compatible");
  return (provider as BrowserProvider).send("eth_sendTransaction", [
    { value: toHexString(BigInt(value || 0)), from, to, data } as Todo,
  ]);
};

export const getChecksumAddressFromAsset = (asset: Asset, chain: EVMChain) => {
  const assetAddress = getTokenAddress(asset, chain);

  if (assetAddress) {
    return getAddress(assetAddress.toLowerCase());
  }

  throw new Error("invalid gas asset address");
};

export const getTokenAddress = ({ chain, symbol, ticker }: Asset, baseAssetChain: EVMChain) => {
  try {
    if (
      (chain === baseAssetChain && symbol === baseAssetChain && ticker === baseAssetChain) ||
      (chain === Chain.BinanceSmartChain && symbol === "BNB" && ticker === "BNB") ||
      (chain === Chain.Arbitrum && symbol === "ETH" && ticker === "ETH")
    ) {
      return baseAssetAddress[baseAssetChain];
    }

    // strip 0X only - 0x is still valid
    return getAddress(symbol.slice(ticker.length + 1).replace(/^0X/, ""));
  } catch (_error) {
    return null;
  }
};

export const getFeeForTransaction = async (
  txObject: EIP1559TxParams,
  feeOption: FeeOption,
  provider: Provider | BrowserProvider,
  isEIP1559Compatible: boolean,
) => {
  const gasPrices = (await estimateGasPrices(provider, isEIP1559Compatible))[feeOption];
  const gasLimit = await provider.estimateGas(txObject);

  if (!isEIP1559Compatible && gasPrices.gasPrice) {
    return gasPrices.gasPrice * gasLimit;
  }

  if (gasPrices.maxFeePerGas && gasPrices.maxPriorityFeePerGas) {
    return (gasPrices.maxFeePerGas + gasPrices.maxPriorityFeePerGas) * gasLimit;
  }

  // TODO:
  throw new Error("No gas price found");
};

export const BaseEVMToolbox = ({
  provider,
  signer,
  isEIP1559Compatible = true,
}: {
  signer?: Signer | JsonRpcSigner | HDNodeWallet;
  provider: Provider | BrowserProvider;
  isEIP1559Compatible?: boolean;
}) => ({
  approve: (params: ApproveParams) => approve(provider, params, signer, isEIP1559Compatible),
  approvedAmount: (params: ApprovedParams) => approvedAmount(provider, params),
  broadcastTransaction: provider.broadcastTransaction,
  call: <T>(params: CallParams) => call<T>(provider, isEIP1559Compatible, { ...params, signer }),
  createContract: (
    address: string,
    abi: (JsonFragment | Fragment)[],
    contractProvider?: Provider,
  ) => createContract(address, abi, contractProvider || provider),
  createContractTxObject: (params: CallParams) => createContractTxObject(provider, params),
  EIP1193SendTransaction: (tx: EIP1559TxParams) => EIP1193SendTransaction(provider, tx),
  estimateCall: (params: EstimateCallParams) => estimateCall(provider, { ...params, signer }),
  estimateGasLimit: ({
    assetValue,
    recipient,
    memo,
  }: WalletTxParams & { assetValue: AssetValue }) =>
    estimateGasLimit(provider, { assetValue, recipient, memo, signer }),
  estimateGasPrices: () => estimateGasPrices(provider, isEIP1559Compatible),
  isApproved: (params: IsApprovedParams) => isApproved(provider, params),
  sendTransaction: (params: EIP1559TxParams, feeOption: FeeOption) =>
    sendTransaction(provider, params, feeOption, signer, isEIP1559Compatible),
  transfer: (params: TransferParams) => transfer(provider, params, signer, isEIP1559Compatible),
  validateAddress,
});

export type BaseEVMWallet = ReturnType<typeof BaseEVMToolbox>;
export type EVMWallets = {
  [chain in EVMChain]: BaseEVMWallet;
};
