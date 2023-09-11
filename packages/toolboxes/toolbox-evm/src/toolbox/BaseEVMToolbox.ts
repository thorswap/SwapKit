import { AssetEntity, getSignatureAssetFor, isGasAsset } from '@thorswap-lib/swapkit-entities';
import type {
  Asset,
  EIP1559TxParams,
  EVMChain,
  EVMTxParams,
  LegacyEVMTxParams,
  WalletTxParams,
} from '@thorswap-lib/types';
import { Chain, ContractAddress, erc20ABI, FeeOption } from '@thorswap-lib/types';
import type {
  BigNumberish,
  BrowserProvider,
  Fragment,
  JsonFragment,
  Provider,
  Signer,
} from 'ethers';
import { getAddress } from 'ethers/address';
import { MaxInt256 } from 'ethers/constants';

import { SwapKitNumber } from '../../../../swapkit/swapkit-helpers/src/index.ts';
import type {
  ApprovedParams,
  ApproveParams,
  CallParams,
  EstimateCallParams,
  IsApprovedParams,
  TransferParams,
} from '../types/clientTypes.ts';

export const MAX_APPROVAL = MaxInt256;

const baseAssetAddress: Record<EVMChain, string> = {
  [Chain.Arbitrum]: ContractAddress.ARB,
  [Chain.Ethereum]: ContractAddress.ETH,
  [Chain.Avalanche]: ContractAddress.AVAX,
  [Chain.BinanceSmartChain]: ContractAddress.BSC,
  [Chain.Polygon]: ContractAddress.MATIC,
  [Chain.Optimism]: ContractAddress.OP,
};

const stateMutable = ['payable', 'nonpayable'];
// const nonStateMutable = ['view', 'pure'];

const isEIP1559Transaction = (tx: EVMTxParams) =>
  (tx as EIP1559TxParams).type === 2 ||
  !!(tx as EIP1559TxParams).maxFeePerGas ||
  !!(tx as EIP1559TxParams).maxPriorityFeePerGas;

const isBrowserProvider = (provider: any) => !!provider.provider || !!provider.jsonRpcFetchFunc;
const createContract = async (
  address: string,
  abi: readonly (JsonFragment | Fragment)[],
  provider: Provider,
) => {
  const { Contract } = await import('ethers/contract');
  const { Interface } = await import('ethers/abi');
  return new Contract(address, Interface.from(abi), provider);
};

export const toHexString = (value: BigInt) => '0x' + value.toString(16);

const validateAddress = (address: string) => {
  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
};

const isStateChangingCall = (abi: readonly JsonFragment[], functionName: string) => {
  const abiFragment = abi.find((fragment: any) => fragment.name === functionName) as any;
  if (!abiFragment) throw new Error(`No ABI fragment found for function ${functionName}`);
  return abiFragment.stateMutability && stateMutable.includes(abiFragment.stateMutability);
};

const getAssetEntity = (asset: Asset | undefined) =>
  asset
    ? new AssetEntity(asset.chain, asset.symbol, asset.synth, asset.ticker)
    : getSignatureAssetFor(Chain.Ethereum);

type WithSigner<T> = T & { signer?: Signer };

/**
 * @info call contract function
 * When using this method to make a non state changing call to the blockchain, like a isApproved call,
 * the signer needs to be set to undefined
 */
const call = async <T>(
  provider: Provider,
  {
    callProvider,
    signer,
    contractAddress,
    abi,
    funcName,
    funcParams = [],
    txOverrides,
  }: WithSigner<CallParams>,
): Promise<T> => {
  const contractProvider = callProvider || provider;
  if (!contractAddress) throw new Error('contractAddress must be provided');

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

  const contract = await createContract(contractAddress, abi, contractProvider);

  // only use signer if the contract function is state changing
  if (isStateChanging) {
    if (!signer) throw new Error('Signer is not defined');

    const address = txOverrides?.from || (await signer.getAddress());

    if (!address) throw new Error('No signer address found');

    const connectedContract = contract.connect(signer);

    // @ts-expect-error TODO: Check if that calls contract function
    const result = await connectedContract[funcName](...funcParams, {
      ...txOverrides,
      /**
       * nonce must be set due to a possible bug with ethers.js,
       * expecting a synchronous nonce while the JsonRpcProvider delivers Promise
       */
      nonce: txOverrides?.nonce || (await contractProvider.getTransactionCount(address)),
    });

    return typeof result?.hash === 'string' ? result?.hash : result;
  }

  const result = await contract[funcName](...funcParams);

  return typeof result?.hash === 'string' ? result?.hash : result;
};

const createContractTxObject = async (
  provider: Provider,
  { contractAddress, abi, funcName, funcParams = [], txOverrides }: CallParams,
) =>
  (await createContract(contractAddress, abi, provider))
    .getFunction(funcName)
    .populateTransaction(...funcParams.concat(txOverrides).filter((p) => typeof p !== 'undefined'));

const approvedAmount = async (
  provider: Provider,
  { assetAddress, spenderAddress, from }: IsApprovedParams,
) =>
  await call<BigNumberish>(provider, {
    contractAddress: assetAddress,
    abi: erc20ABI as any,
    funcName: 'allowance',
    funcParams: [from, spenderAddress],
  }).toString();

const isApproved = async (
  provider: Provider,
  { assetAddress, spenderAddress, from, amount = MAX_APPROVAL }: IsApprovedParams,
) =>
  SwapKitNumber.fromBigInt(
    BigInt(await approvedAmount(provider, { assetAddress, spenderAddress, from })),
  ).gte(SwapKitNumber.fromBigInt(BigInt(amount)));

const approve = async (
  provider: Provider,
  {
    assetAddress,
    spenderAddress,
    feeOptionKey = FeeOption.Fast,
    amount = MAX_APPROVAL,
    gasLimitFallback,
    from,
    nonce,
  }: ApproveParams,
  signer?: Signer,
  isEIP1559Compatible = true,
) => {
  if (!amount) throw new Error('amount must be provided');
  const funcParams = [spenderAddress, BigInt(amount)];
  const txOverrides = { from };

  const functionCallParams = {
    contractAddress: assetAddress,
    abi: erc20ABI,
    funcName: 'approve',
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

  const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = (
    await estimateGasPrices(provider, isEIP1559Compatible)
  )[feeOptionKey];

  const gasLimit = await estimateCall(provider, functionCallParams).catch(() =>
    BigInt(gasLimitFallback ?? 0),
  );

  return call<string>(provider, {
    ...functionCallParams,
    funcParams,
    txOverrides: {
      from,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      gasLimit,
      nonce,
    },
  });
};

const transfer = async (
  provider: Provider | BrowserProvider,
  {
    asset,
    memo,
    amount,
    recipient,
    feeOptionKey = FeeOption.Fast,
    data,
    from,
    ...tx
  }: TransferParams,
  signer?: Signer,
  isEIP1559Compatible = true,
) => {
  // TODO - this might be wrong
  const txAmount = amount.bigIntValue;
  const parsedAsset: AssetEntity = getAssetEntity(asset);
  const chain = parsedAsset.L1Chain as EVMChain;

  if (!isGasAsset(parsedAsset)) {
    const contractAddress = getTokenAddress(parsedAsset, chain);
    if (!contractAddress) throw new Error('No contract address found');
    // Transfer ERC20
    return call<string>(provider, {
      signer,
      contractAddress,
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [recipient, txAmount],
      txOverrides: { from },
    });
  }

  const { hexlify, toUtf8Bytes } = await import('ethers/utils');

  // Transfer ETH
  const txObject = {
    ...tx,
    from,
    to: recipient,
    value: txAmount,
    data: data || hexlify(toUtf8Bytes(memo || '')),
  };

  return sendTransaction(provider, txObject, feeOptionKey, signer, isEIP1559Compatible);
};

const estimateGasPrices = async (provider: Provider, isEIP1559Compatible = true) => {
  try {
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider.getFeeData();

    switch (isEIP1559Compatible) {
      case true:
        if (!maxFeePerGas || !maxPriorityFeePerGas) throw new Error('No fee data available');

        return {
          [FeeOption.Average]: {
            maxFeePerGas,
            maxPriorityFeePerGas,
          },
          [FeeOption.Fast]: {
            maxFeePerGas: (maxFeePerGas * 15n) / 10n,
            maxPriorityFeePerGas: (maxPriorityFeePerGas * 15n) / 10n,
          },
          [FeeOption.Fastest]: {
            maxFeePerGas: maxFeePerGas * 2n,
            maxPriorityFeePerGas: maxPriorityFeePerGas * 2n,
          },
        };

      case false:
        if (!gasPrice) throw new Error('No fee data available');

        return {
          [FeeOption.Average]: {
            gasPrice,
          },
          [FeeOption.Fast]: {
            gasPrice: (gasPrice * 15n) / 10n,
          },
          [FeeOption.Fastest]: {
            gasPrice: gasPrice * 2n,
          },
        };
    }
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as any).msg ?? (error as any).toString()}`,
    );
  }
};

const estimateCall = async (
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
  if (!contractAddress) throw new Error('contractAddress must be provided');

  const contract = await createContract(contractAddress, abi, provider);
  return signer
    ? contract
        .connect(signer)
        .getFunction(funcName)
        .estimateGas(...funcParams, txOverrides)
    : contract.getFunction(funcName).estimateGas(...funcParams, txOverrides);
};

const estimateGasLimit = async (
  provider: Provider,
  {
    asset,
    recipient,
    amount,
    memo,
    from,
    funcName,
    funcParams,
    txOverrides,
    signer,
  }: WalletTxParams & {
    funcName?: string;
    funcParams?: unknown[];
    signer?: Signer;
    txOverrides?: EVMTxParams;
  },
) => {
  const { hexlify, toUtf8Bytes } = await import('ethers/utils');
  const value = amount.bigIntValue;
  const parsedAsset = getAssetEntity(asset);
  const assetAddress = !isGasAsset(parsedAsset)
    ? getTokenAddress(parsedAsset, parsedAsset.L1Chain as EVMChain)
    : null;

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
  } else {
    return provider.estimateGas({
      from,
      to: recipient,
      value,
      // TODO: Check if memo is a valid hex string
      data: memo ? hexlify(toUtf8Bytes(memo)) : undefined,
    });
  }
};

const sendTransaction = async (
  provider: Provider | BrowserProvider,
  tx: EVMTxParams,
  feeOptionKey: FeeOption = FeeOption.Fast,
  signer?: Signer,
  isEIP1559Compatible = true,
) => {
  if (!signer) throw new Error('Signer is not defined');
  const { from, to, data, value, ...transaction } = tx;
  if (!to) throw new Error('No to address provided');

  const parsedTxObject = {
    ...transaction,
    data: data || '0x',
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

  const isEIP1559 = isEIP1559Transaction(tx) || isEIP1559Compatible;

  const feeData =
    (isEIP1559 &&
      (!(tx as EIP1559TxParams).maxFeePerGas || !(tx as EIP1559TxParams).maxPriorityFeePerGas)) ||
    !(tx as LegacyEVMTxParams).gasPrice
      ? Object.entries(
          (await estimateGasPrices(provider, isEIP1559Compatible))[feeOptionKey],
        ).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: BigInt(v).toString(16) }),
          {} as {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
            gasPrice?: string;
          },
        )
      : {};

  let gasLimit: string;
  try {
    gasLimit = toHexString(tx.gasLimit || ((await provider.estimateGas(tx)) * 11n) / 10n);
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
      const txHex = await signer.signTransaction(txObject);
      const response = await provider.broadcastTransaction(txHex);

      return typeof response?.hash === 'string' ? response.hash : response;
    } catch (error) {
      const response = await signer.sendTransaction(txObject);

      return typeof response?.hash === 'string' ? response.hash : response;
    }
  } catch (error) {
    throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
  }
};

/**
 * Exported helper functions
 */
export const toChecksumAddress = (address: string) => getAddress(address);

export const EIP1193SendTransaction = async (
  provider: Provider | BrowserProvider,
  { from, to, data, value }: EVMTxParams,
): Promise<string> => {
  if (!isBrowserProvider(provider)) throw new Error('Provider is not EIP-1193 compatible');
  return (provider as BrowserProvider).send('eth_sendTransaction', [
    { value: toHexString(BigInt(value || 0)), from, to, data } as any,
  ]);
};

export const getChecksumAddressFromAsset = (asset: Asset, chain: EVMChain) => {
  const parsedAsset = getAssetEntity(asset);
  const assetAddress = getTokenAddress(parsedAsset, chain);

  if (assetAddress) {
    return getAddress(assetAddress.toLowerCase());
  }

  throw new Error('invalid gas asset address');
};

export const getTokenAddress = ({ chain, symbol, ticker }: Asset, baseAssetChain: EVMChain) => {
  try {
    if (chain === baseAssetChain && symbol === baseAssetChain && ticker === baseAssetChain) {
      return baseAssetAddress[baseAssetChain];
    }

    // strip 0X only - 0x is still valid
    return getAddress(symbol.slice(ticker.length + 1).replace(/^0X/, ''));
  } catch (err) {
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

  if (!isEIP1559Compatible) {
    return gasPrices.gasPrice! * gasLimit;
  }

  return (gasPrices.maxFeePerGas! + gasPrices.maxPriorityFeePerGas!) * gasLimit;
};

export const BaseEVMToolbox = ({
  provider,
  signer,
  isEIP1559Compatible = true,
}: {
  signer?: Signer;
  provider: Provider | BrowserProvider;
  isEIP1559Compatible?: boolean;
}) => ({
  approve: (params: ApproveParams) => approve(provider, params, signer, isEIP1559Compatible),
  approvedAmount: (params: ApprovedParams) => approvedAmount(provider, params),
  broadcastTransaction: provider.broadcastTransaction,
  call: (params: CallParams) => call(provider, { ...params, signer }),
  createContract,
  createContractTxObject: (params: CallParams) => createContractTxObject(provider, params),
  EIP1193SendTransaction: (tx: EIP1559TxParams) => EIP1193SendTransaction(provider, tx),
  estimateCall: (params: EstimateCallParams) => estimateCall(provider, { ...params, signer }),
  estimateGasLimit: ({ asset, recipient, amount, memo }: WalletTxParams) =>
    estimateGasLimit(provider, { asset, recipient, amount, memo, signer }),
  estimateGasPrices: () => estimateGasPrices(provider, isEIP1559Compatible),
  isApproved: (params: IsApprovedParams) => isApproved(provider, params),
  sendTransaction: (params: EIP1559TxParams, feeOption: FeeOption) =>
    sendTransaction(provider, params, feeOption, signer, isEIP1559Compatible),
  transfer: (params: TransferParams) => transfer(provider, params, signer, isEIP1559Compatible),
  validateAddress,
});
