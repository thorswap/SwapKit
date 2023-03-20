import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { getAddress } from '@ethersproject/address';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { hexlify } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { toUtf8Bytes } from '@ethersproject/strings';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  AmountWithBaseDenom,
  Asset as AssetType,
  BaseDecimal,
  Chain,
  ContractAddress,
  EIP1559TxParams,
  erc20ABI,
  EVMChain,
  FeeOption,
  WalletOption,
  WalletTxParams,
} from '@thorswap-lib/types';

import {
  ApproveParams,
  CallParams,
  EstimateCallParams,
  IsApprovedParams,
  SendTransactionParams,
} from '../types/index.js';

const MAX_APPROVAL = BigNumber.from('2').pow('256').sub('1');

const baseAssetAddress: Record<EVMChain, string> = {
  [Chain.Ethereum]: ContractAddress.ETH,
  [Chain.Arbitrum]: ContractAddress.AETH,
  [Chain.Avalanche]: ContractAddress.AVAX,
  [Chain.BinanceSmartChain]: ContractAddress.BSC,
  [Chain.Optimism]: ContractAddress.ETH,
  [Chain.Polygon]: ContractAddress.MATIC,
};

const isWeb3Provider = (provider: any) => provider?.constructor?.name === 'Web3Provider';
const createContract = (address: string, abi: any, provider: Provider) =>
  new Contract(address, abi, provider);

const validateAddress = (address: Address): boolean => {
  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
};

const getFee = ({
  maxGasPrice,
  gasLimit,
}: {
  maxGasPrice: AmountWithBaseDenom;
  gasLimit: BigNumber;
}) => baseAmount(maxGasPrice.amount().mul(gasLimit.toString()), BaseDecimal.ETH);

const getAssetEntity = (asset: AssetType | undefined) =>
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
  { signer, contractAddress, abi, funcName, funcParams = [] }: WithSigner<CallParams>,
): Promise<T> => {
  if (!contractAddress) throw new Error('contractAddress must be provided');
  if (isWeb3Provider(provider) && signer) {
    const txObject = await createContractTxObject(provider, {
      contractAddress,
      abi,
      funcName,
      funcParams,
    });

    return EIP1193SendTransaction(provider, txObject) as Promise<T>;
  }

  const contract = createContract(contractAddress, abi, provider);
  const result = await (signer
    ? contract.connect(signer)[funcName](...funcParams.slice(0, -1), {
        ...(funcParams[funcParams.length - 1] as any),
        /**
         * nonce must be set due to a possible bug with ethers.js,
         * expecting a synchronous nonce while the JsonRpcProvider delivers Promise
         */
        nonce:
          (funcParams[funcParams.length - 1] as any).nonce ||
          (await provider.getTransactionCount(signer.getAddress())),
      })
    : contract[funcName](...funcParams));

  return typeof result?.hash === 'string' ? result?.hash : result;
};

const createContractTxObject = async (
  provider: Provider,
  { contractAddress, abi, funcName, funcParams = [] }: CallParams,
) => createContract(contractAddress, abi, provider).populateTransaction[funcName](...funcParams);

const estimateCall = async (
  provider: Provider,
  {
    signer,
    contractAddress,
    abi,
    funcName,
    funcParams = [],
  }: EstimateCallParams & { signer?: Signer },
) => {
  if (!contractAddress) throw new Error('contractAddress must be provided');

  const contract = createContract(contractAddress, abi, provider);
  return signer
    ? contract.connect(signer).estimateGas[funcName](...funcParams)
    : contract.estimateGas[funcName](...funcParams);
};

const isApproved = async (
  provider: Provider,
  { assetAddress, spenderAddress, from }: IsApprovedParams,
) =>
  await call<BigNumberish>(provider, {
    contractAddress: assetAddress,
    abi: erc20ABI,
    funcName: 'allowance',
    funcParams: [from, spenderAddress],
  });

const approve = async (
  provider: Provider,
  signer: Signer,
  {
    assetAddress,
    spenderAddress,
    feeOptionKey = FeeOption.Fastest,
    amount,
    walletIndex = 0,
    gasLimitFallback,
    from,
    nonce,
  }: ApproveParams,
) => {
  const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData({
    provider,
    feeOptionKey,
  });

  const funcParams = [spenderAddress, amount?.amount() || MAX_APPROVAL, { from }];

  const functionCallParams = {
    walletIndex,
    contractAddress: assetAddress,
    abi: erc20ABI,
    funcName: 'approve',
    funcParams,
    signer,
  };

  const gasLimit = await estimateCall(provider, functionCallParams).catch(() =>
    BigNumber.from(gasLimitFallback),
  );

  if (isWeb3Provider(provider)) {
    return await EIP1193SendTransaction(
      provider,
      await createContractTxObject(provider, functionCallParams),
    );
  }

  return call<string>(provider, {
    ...functionCallParams,
    funcParams: [
      ...funcParams.slice(0, funcParams.length - 1),
      {
        from,
        maxFeePerGas,
        gasLimit,
        maxPriorityFeePerGas,
        nonce,
      },
    ],
  });
};

export type TransferParams = WalletTxParams & {
  gasPrice?: AmountWithBaseDenom;
  gasLimit?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  data?: string;
  from: string;
  nonce?: number;
};

const transfer = async (
  provider: Provider | Web3Provider,
  signer: Signer,
  {
    asset,
    memo,
    amount,
    recipient,
    feeOptionKey = FeeOption.Fast,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    data,
    from,
    nonce,
  }: TransferParams,
) => {
  // TODO: create a method that creates the base tx object! @towan
  const txAmount = amount.amount();
  const parsedAsset: AssetEntity = getAssetEntity(asset);
  const chain = parsedAsset.L1Chain as EVMChain;
  const assetAddress = getTokenAddress(parsedAsset, chain);
  const isGasAddress = assetAddress === ContractAddress[chain];
  const chainId = (await provider.getNetwork()).chainId;

  const gasFees = await getFeeData({ provider, feeOptionKey: feeOptionKey });

  const overrides = {
    type: 2,
    gasLimit:
      gasLimit || (await estimateGasLimit(provider, { asset, recipient, amount, memo, from })),
    maxFeePerGas: maxFeePerGas || gasFees.maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas || gasFees.maxPriorityFeePerGas,
    nonce: nonce || (await provider.getTransactionCount(from)),
    from,
  };

  let txObject;
  if (assetAddress && !isGasAddress) {
    // Transfer ERC20
    return call(provider, {
      signer,
      contractAddress: assetAddress,
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [recipient, txAmount, overrides],
    });
  } else {
    // Transfer ETH
    txObject = Object.assign(
      { to: recipient, value: txAmount, from, chainId },
      {
        ...overrides,
        data: data || (memo ? hexlify(toUtf8Bytes(memo)) : undefined),
      },
    );
  }

  if (isWeb3Provider(provider)) {
    return EIP1193SendTransaction(provider, txObject);
  }

  const signedTx = await signer.signTransaction(txObject);
  const txResult = await provider.sendTransaction(signedTx);

  return txResult.hash;
};

const estimateGasPrices = async (provider: Provider) => {
  try {
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

    if (!maxFeePerGas || !maxPriorityFeePerGas) throw new Error('No fee data available');

    return {
      [FeeOption.Average]: {
        maxFeePerGas: baseAmount(maxFeePerGas, BaseDecimal.ETH),
        maxPriorityFeePerGas: baseAmount(maxPriorityFeePerGas, BaseDecimal.ETH),
      },
      [FeeOption.Fast]: {
        maxFeePerGas: baseAmount(maxFeePerGas.mul(3).div(2), BaseDecimal.ETH),
        maxPriorityFeePerGas: baseAmount(maxPriorityFeePerGas, BaseDecimal.ETH),
      },
      [FeeOption.Fastest]: {
        maxFeePerGas: baseAmount(maxFeePerGas.mul(2), BaseDecimal.ETH),
        maxPriorityFeePerGas: baseAmount(maxPriorityFeePerGas, BaseDecimal.ETH),
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as any).msg ?? (error as any).toString()}`,
    );
  }
};

const estimateGasLimit = async (
  provider: Provider,
  { asset, recipient, amount, memo, from }: WalletTxParams,
) => {
  const value = amount.amount();
  const parsedAsset = getAssetEntity(asset);
  const assetAddress = getTokenAddress(parsedAsset, parsedAsset.L1Chain as EVMChain);

  if (assetAddress && assetAddress !== ContractAddress.ETH) {
    // ERC20 gas estimate
    const contract = createContract(assetAddress, erc20ABI, provider);

    return contract.estimateGas.transfer(recipient, value, { from });
  } else {
    return provider.estimateGas({
      from,
      to: recipient,
      value,
      data: memo ? toUtf8Bytes(memo) : undefined,
    });
  }
};

const estimateFeesWithGasPricesAndLimits = async (provider: Provider, params: WalletTxParams) => {
  const { asset, amount, recipient, memo, from } = params;

  // gas prices
  const gasPrices = await estimateGasPrices(provider);
  const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices;

  // gas limits
  const gasLimit = await estimateGasLimit(provider, {
    asset,
    amount,
    recipient,
    memo,
    from,
  });

  return {
    gasLimit,
    gasPrices,
    fees: {
      average: getFee({
        maxGasPrice: averageGP.maxFeePerGas.plus(averageGP.maxPriorityFeePerGas),
        gasLimit,
      }),
      fast: getFee({
        maxGasPrice: fastGP.maxFeePerGas.plus(fastGP.maxPriorityFeePerGas),
        gasLimit,
      }),
      fastest: getFee({
        maxGasPrice: fastestGP.maxFeePerGas.plus(fastestGP.maxPriorityFeePerGas),
        gasLimit,
      }),
    },
  };
};

const getFees = async (provider: Provider, params?: WalletTxParams) => {
  if (!params) throw new Error('Params need to be passed');

  const { fees } = await estimateFeesWithGasPricesAndLimits(provider, params);
  return fees;
};

const getFeeData = async ({
  feeOptionKey = FeeOption.Average,
  provider,
}: {
  feeOptionKey?: FeeOption;
  provider: Provider;
}) => {
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateGasPrices(provider).then(
    (prices) => prices[feeOptionKey],
  );

  return {
    maxFeePerGas: maxFeePerGas.amount(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.amount(),
  };
};

const sendTransaction =
  ({ provider, signer }: SendTransactionParams) =>
  async (tx: EIP1559TxParams, feeOptionKey: FeeOption) => {
    const address = await signer.getAddress();
    const feeData = await getFeeData({ feeOptionKey, provider });
    const nonce = tx.nonce || (await provider.getTransactionCount(address));
    const chainId = (await provider.getNetwork()).chainId;

    let gasLimit: BigNumber;
    try {
      gasLimit = (await provider.estimateGas(tx)).mul(110).div(100);
    } catch (error) {
      throw new Error(`Error estimating gas limit: ${JSON.stringify(error)}`);
    }
    try {
      const { value, ...transaction } = tx;
      const txObject = {
        ...transaction,
        chainId,
        type: 2,
        gasLimit: gasLimit.toHexString(),
        maxFeePerGas: feeData.maxFeePerGas.toHexString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toHexString(),
        nonce,
        ...(value && !BigNumber.from(value).isZero() ? { value } : {}),
      };

      if (isWeb3Provider(provider)) {
        return await EIP1193SendTransaction(provider, txObject);
      }

      const txHex = await signer.signTransaction(txObject);
      const response = await provider.sendTransaction(txHex);

      return typeof response?.hash === 'string' ? response.hash : response;
    } catch (error) {
      throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
    }
  };

const listWeb3EVMWallets = () => {
  const metamaskEnabled = window?.ethereum && !window.ethereum?.isBraveWallet;
  const xdefiEnabled = window?.xfi || window?.ethereum?.__XDEFI;
  const braveEnabled = window?.ethereum?.isBraveWallet;
  const trustEnabled = window?.ethereum?.isTrust || window?.trustwallet;
  const coinbaseEnabled =
    (window?.ethereum?.overrideIsMetaMask &&
      window?.ethereum?.selectedProvider?.isCoinbaseWallet) ||
    window?.coinbaseWalletExtension;

  const wallets = [];
  if (metamaskEnabled) wallets.push(WalletOption.METAMASK);
  if (xdefiEnabled) wallets.push(WalletOption.XDEFI);
  if (braveEnabled) wallets.push(WalletOption.BRAVE);
  if (trustEnabled) wallets.push(WalletOption.TRUSTWALLET_WEB);
  if (coinbaseEnabled) wallets.push(WalletOption.COINBASE_WEB);

  return wallets;
};

const isWeb3Detected = () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Exported helper functions
 */
export const getBigNumberFrom = (value: string | number | BigNumber) => BigNumber.from(value);
export const toChecksumAddress = (address: string) => getAddress(address);
export const isDetected = (walletOption: WalletOption) => {
  return listWeb3EVMWallets().includes(walletOption);
};

export const addAccountsChangedCallback = (callback: () => void) => {
  window.ethereum?.on('accountsChanged', () => callback());
  window.xfi?.ethereum.on('accountsChanged', () => callback());
};

export const getETHDefaultWallet = () => {
  const { isTrust, isBraveWallet, __XDEFI, overrideIsMetaMask, selectedProvider } =
    window?.ethereum || {};
  if (isTrust) return WalletOption.TRUSTWALLET_WEB;
  if (isBraveWallet) return WalletOption.BRAVE;
  if (overrideIsMetaMask && selectedProvider?.isCoinbaseWallet) return WalletOption.COINBASE_WEB;
  if (__XDEFI) WalletOption.XDEFI;
  return WalletOption.METAMASK;
};

export const EIP1193SendTransaction = async (
  provider: any, // Web3Provider,
  { from, to, data, value }: EIP1559TxParams & { type?: number | string },
): Promise<string> =>
  provider.provider?.request?.({
    method: 'eth_sendTransaction',
    params: [{ value: BigNumber.from(value || 0).toHexString(), from, to, data }],
  });

export const getChecksumAddressFromAsset = (asset: AssetType, chain: EVMChain) => {
  const parsedAsset = getAssetEntity(asset);
  const assetAddress = getTokenAddress(parsedAsset, chain);

  if (assetAddress) {
    return getAddress(assetAddress.toLowerCase());
  }

  throw new Error('invalid gas asset address');
};

export const getTokenAddress = ({ chain, symbol, ticker }: AssetType, baseAssetChain: EVMChain) => {
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

export const BaseEVMToolbox = ({
  provider,
  signer,
}: {
  signer: Signer;
  provider: Provider | Web3Provider;
}) => ({
  isDetected,
  listWeb3EVMWallets,
  getETHDefaultWallet,
  isWeb3Detected,
  createContract,
  EIP1193SendTransaction: (tx: EIP1559TxParams) => EIP1193SendTransaction(provider, tx),
  createContractTxObject: (params: CallParams) => createContractTxObject(provider, params),
  approve: (params: ApproveParams) => approve(provider, signer, params),
  transfer: (params: TransferParams) => transfer(provider, signer, params),
  call: (params: CallParams) => call(provider, { ...params, signer }),
  estimateGasPrices: () => estimateGasPrices(provider),
  getFees: (params?: WalletTxParams) => getFees(provider, params),
  isApproved: (params: IsApprovedParams) => isApproved(provider, params),
  validateAddress,
  sendTransaction: sendTransaction({ provider, signer }),
  broadcastTransaction: provider.sendTransaction,
  estimateCall: (params: EstimateCallParams) => estimateCall(provider, { ...params, signer }),
  estimateGasLimit: ({ asset, recipient, amount, memo }: WalletTxParams) =>
    estimateGasLimit(provider, { asset, recipient, amount, memo }),
  getFeeData: (feeOptionKey = FeeOption.Average) => getFeeData({ feeOptionKey, provider }),
  addAccountsChangedCallback,
});
