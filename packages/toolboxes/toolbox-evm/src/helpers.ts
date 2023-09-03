import { BigNumber } from '@ethersproject/bignumber';
import type { ExternalProvider } from '@ethersproject/providers';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Chain, ChainId, ChainToHexChainId, FeeOption, WalletOption } from '@thorswap-lib/types';

import type { EthereumWindowProvider, EVMMaxSendableAmountsParams } from './index.ts';
import { AVAXToolbox, BSCToolbox, ETHToolbox } from './index.ts';

type NetworkParams = {
  chainId: ChainId;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
};

type ProviderRequestParams = {
  provider?: ExternalProvider;
  params?: any;
  method:
    | 'wallet_addEthereumChain'
    | 'wallet_switchEthereumChain'
    | 'eth_requestAccounts'
    | 'eth_sendTransaction'
    | 'eth_signTransaction';
};

const methodsToWrap = [
  'approve',
  'approvedAmount',
  'call',
  'sendTransaction',
  'transfer',
  'getBalance',
  'isApproved',
  'approvedAmount',
  'EIP1193SendTransaction',
  'getFeeData',
  'broadcastTransaction',
  'estimateCall',
  'estimateGasLimit',
  'estimateGasPrices',
  'createContractTxObject',
];

export const prepareNetworkSwitch = <T extends { [key: string]: (...args: any[]) => any }>({
  toolbox,
  chainId,
  provider = window.ethereum,
}: {
  toolbox: T;
  chainId: ChainId;
  provider?: ExternalProvider;
}) => {
  const wrappedMethods = methodsToWrap.reduce((object, methodName) => {
    if (!toolbox[methodName]) return object;
    const method = toolbox[methodName];

    return {
      ...object,
      [methodName]: wrapMethodWithNetworkSwitch<typeof method>(method, provider, chainId),
    };
  }, {});

  return { ...toolbox, ...wrappedMethods };
};

export const wrapMethodWithNetworkSwitch = <T extends (...args: any[]) => any>(
  func: T,
  provider: ExternalProvider,
  chainId: ChainId,
) =>
  (async (...args: any[]) => {
    try {
      await switchEVMWalletNetwork(provider, chainId);
    } catch (error) {
      throw new Error(`Failed to switch network: ${error}`);
    }
    return func(...args);
  }) as unknown as T;

const providerRequest = async ({ provider, params, method }: ProviderRequestParams) => {
  if (!provider?.request) throw new Error('Provider not found');

  const providerParams = params ? (Array.isArray(params) ? params : [params]) : [];
  return provider.request({ method, params: providerParams });
};

export const addEVMWalletNetwork = (provider: ExternalProvider, networkParams: NetworkParams) =>
  providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (provider: ExternalProvider, chainId = ChainId.EthereumHex) =>
  providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });

export const getWeb3WalletMethods = async ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  ethereumWindowProvider: EthereumWindowProvider | undefined;
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}) => {
  if (!ethereumWindowProvider) throw new Error('Requested web3 wallet is not installed');

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  const provider = new Web3Provider(ethereumWindowProvider, 'any');

  const toolboxParams = {
    provider,
    signer: provider.getSigner(),
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const toolbox =
    chain === Chain.Ethereum
      ? ETHToolbox(toolboxParams)
      : chain === Chain.Avalanche
      ? AVAXToolbox(toolboxParams)
      : BSCToolbox(toolboxParams);

  try {
    chain !== Chain.Ethereum &&
      (await addEVMWalletNetwork(
        ethereumWindowProvider,
        (
          toolbox as ReturnType<typeof AVAXToolbox> | ReturnType<typeof BSCToolbox>
        ).getNetworkParams(),
      ));
  } catch (error) {
    throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
  }
  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider: ethereumWindowProvider,
  });
};

export const estimateMaxSendableAmount = async ({
  toolbox,
  from,
  memo = '',
  feeOptionKey = FeeOption.Fastest,
  asset,
  abi,
  funcName,
  funcParams,
  contractAddress,
  txOverrides,
}: EVMMaxSendableAmountsParams) => {
  const assetEntity = typeof asset === 'string' ? AssetEntity.fromAssetString(asset) : asset;
  const balance = (await toolbox.getBalance(from)).find((balance) =>
    assetEntity
      ? balance.asset.symbol === assetEntity.symbol
      : balance.asset.symbol === getSignatureAssetFor(balance.asset.chain)?.symbol,
  );

  if (!balance) return baseAmount(0);

  if (assetEntity && getSignatureAssetFor(balance.asset.chain).shallowEq(assetEntity)) {
    return balance.amount;
  }

  if ([abi, funcName, funcParams, contractAddress].some((param) => !param)) {
    throw new Error('Missing required parameters for smart contract estimateMaxSendableAmount');
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
          amount: baseAmount('1', 18),
        });

  const fees = (await toolbox.estimateGasPrices())[feeOptionKey];

  if (!fees.gasPrice && !fees.maxFeePerGas) throw new Error('Could not fetch fee data');
  const fee = BigNumber.from(gasLimit).mul(
    !fees.gasPrice ? fees.maxFeePerGas!.add(fees.maxPriorityFeePerGas || 1) : fees.gasPrice!,
  );
  const maxSendableAmount = BigNumber.from(balance.amount.toString()).sub(fee);

  return baseAmount(maxSendableAmount, 18);
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

export const isDetected = (walletOption: WalletOption) => {
  return listWeb3EVMWallets().includes(walletOption);
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

export const isWeb3Detected = () => {
  return typeof window.ethereum !== 'undefined';
};
