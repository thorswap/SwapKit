import { AssetValue, filterAssets, formatBigIntToSafeValue, SwapKitNumber } from '@swapkit/helpers';
import {
  BaseDecimal,
  Chain,
  ChainId,
  ChainToHexChainId,
  type EVMChain,
  FeeOption,
  WalletOption,
} from '@swapkit/types';
import type { BrowserProvider, Eip1193Provider, JsonRpcProvider } from 'ethers';

import type { CovalentApiType, EthplorerApiType, EVMMaxSendableAmountsParams } from './index.ts';
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
  provider?: BrowserProvider;
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
  provider?: BrowserProvider;
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
  provider: BrowserProvider,
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
  if (!provider?.send) throw new Error('Provider not found');

  const providerParams = params ? (Array.isArray(params) ? params : [params]) : [];
  return provider.send(method, providerParams);
};

export const addEVMWalletNetwork = (provider: BrowserProvider, networkParams: NetworkParams) =>
  providerRequest({ provider, method: 'wallet_addEthereumChain', params: [networkParams] });

export const switchEVMWalletNetwork = (provider: BrowserProvider, chainId = ChainId.EthereumHex) =>
  providerRequest({ provider, method: 'wallet_switchEthereumChain', params: [{ chainId }] });

export const getWeb3WalletMethods = async ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  ethereumWindowProvider: Eip1193Provider | undefined;
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

  const { BrowserProvider } = await import('ethers');

  const provider = new BrowserProvider(ethereumWindowProvider, 'any');

  const toolboxParams = {
    provider,
    signer: await provider.getSigner(),
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
        provider,
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
    provider,
  });
};

export const estimateMaxSendableAmount = async ({
  toolbox,
  from,
  memo = '',
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

  const fees = (await toolbox.estimateGasPrices())[feeOptionKey];

  if (!balance) return AssetValue.fromChainOrSignature(assetValue.chain, 0);

  if (assetValue && (balance.chain !== assetValue.chain || balance.symbol !== assetValue?.symbol)) {
    return balance;
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
          assetValue,
        });

  const isFeeEIP1559Compatible = 'maxFeePerGas' in fees;
  const isFeeEVMLegacyCompatible = 'gasPrice' in fees;

  if (!isFeeEVMLegacyCompatible && !isFeeEIP1559Compatible)
    throw new Error('Could not fetch fee data');

  const fee =
    gasLimit *
    (isFeeEIP1559Compatible
      ? fees.maxFeePerGas! + (fees.maxPriorityFeePerGas! || 1n)
      : fees.gasPrice!);
  const maxSendableAmount = SwapKitNumber.fromBigInt(balance.getBaseValue('bigint')).sub(
    fee.toString(),
  );

  return AssetValue.fromChainOrSignature(balance.chain, maxSendableAmount.getValue('string'));
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

  // OKx Mobile detection
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod|ios/i.test(ua);
  const isAndroid = /android|XiaoMi|MiuiBrowser/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isOKApp = /OKApp/i.test(ua);

  const okxMobileEnabled = isMobile && isOKApp;

  const wallets = [];
  if (metamaskEnabled) wallets.push(WalletOption.METAMASK);
  if (xdefiEnabled) wallets.push(WalletOption.XDEFI);
  if (braveEnabled) wallets.push(WalletOption.BRAVE);
  if (trustEnabled) wallets.push(WalletOption.TRUSTWALLET_WEB);
  if (coinbaseEnabled) wallets.push(WalletOption.COINBASE_WEB);
  if (okxMobileEnabled) wallets.push(WalletOption.OKX_MOBILE);

  return wallets;
};

export const isWeb3Detected = () => typeof window.ethereum !== 'undefined';
export const toHexString = (value: bigint) => (value > 0n ? `0x${value.toString(16)}` : '0x0');

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
  const balances =
    chain === Chain.Ethereum
      ? [
          {
            chain: Chain.Ethereum,
            symbol: 'ETH',
            value: formatBigIntToSafeValue({
              value: BigInt(evmGasTokenBalance),
              decimal: 18,
              bigIntDecimal: 18,
            }),
            decimal: BaseDecimal.ETH,
          },
          ...tokenBalances,
        ]
      : tokenBalances;

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
