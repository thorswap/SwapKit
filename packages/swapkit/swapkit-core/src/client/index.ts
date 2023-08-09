import { isHexString } from '@ethersproject/bytes';
import { parseUnits } from '@ethersproject/units';
import {
  assetFromString,
  baseAmount,
  gasFeeMultiplier,
  throwWalletError,
} from '@thorswap-lib/helpers';
import {
  Amount,
  AmountType,
  AssetAmount,
  AssetEntity,
  getMemoFor,
  getMinAmountByChain,
  getSignatureAssetFor,
  isGasAsset,
  ThornameRegisterParam,
} from '@thorswap-lib/swapkit-entities';
import {
  CosmosMaxSendableAmountParams,
  estimateMaxSendableAmount as cosmosEstimateMax,
} from '@thorswap-lib/toolbox-cosmos';
import type {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  EVMMaxSendableAmountsParams,
} from '@thorswap-lib/toolbox-evm';
import { estimateMaxSendableAmount as evmEstimateMax } from '@thorswap-lib/toolbox-evm';
import {
  estimateMaxSendableAmount as utxoEstimateMax,
  UTXOMaxSendableAmountParams,
} from '@thorswap-lib/toolbox-utxo';
import {
  AddChainWalletParams,
  AmountWithBaseDenom,
  BaseDecimal,
  Chain,
  ChainToChainId,
  EVMChain,
  EVMWalletOptions,
  ExtendParams,
  FeeOption,
  MemoType,
  TCAvalancheDepositABI,
  TCEthereumVaultAbi,
  WalletOption,
} from '@thorswap-lib/types';

import {
  AGG_CONTRACT_ADDRESS,
  lowercasedContractAbiMapping,
} from '../aggregator/contracts/index.js';
import { getSwapInParams } from '../aggregator/getSwapInParams.js';

import {
  getAssetForBalance,
  getEmptyWalletStructure,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getInboundData,
  getMimirData,
} from './helpers.js';
import {
  AddLiquidityParams,
  CoreTxParams,
  CreateLiquidityParams,
  EVMWallet,
  QuoteMode,
  SwapParams,
  ThorchainWallet,
  Wallet,
  WalletMethods,
  WithdrawParams,
} from './types.js';

export class SwapKitCore<T = ''> {
  public connectedChains: Wallet = getEmptyWalletStructure();
  public connectedWallets: WalletMethods = getEmptyWalletStructure();
  public readonly stagenet: boolean = false;

  constructor({ stagenet }: { stagenet?: boolean } | undefined = {}) {
    this.stagenet = !!stagenet;
  }

  swap = async ({ streamSwap, recipient, route, feeOptionKey }: SwapParams) => {
    const quoteMode = route.meta.quoteMode as QuoteMode;
    const evmChain = [
      QuoteMode.ETH_TO_ETH,
      QuoteMode.ETH_TO_AVAX,
      QuoteMode.ETH_TO_TC_SUPPORTED,
    ].includes(quoteMode)
      ? Chain.Ethereum
      : Chain.Avalanche;

    switch (quoteMode) {
      case QuoteMode.TC_SUPPORTED_TO_AVAX:
      case QuoteMode.TC_SUPPORTED_TO_TC_SUPPORTED:
      case QuoteMode.TC_SUPPORTED_TO_ETH: {
        const { fromAsset, amountIn, memo, memoStreamingSwap } = route.calldata;
        const asset = AssetEntity.fromAssetString(fromAsset);
        if (!asset) throw new Error('Asset not recognised');

        const swapMemo = (streamSwap ? memoStreamingSwap || memo : memo) as string;

        const amount = new AssetAmount(asset, new Amount(amountIn, 0, asset.decimal));
        const replacedMemo = swapMemo?.replace('{recipientAddress}', recipient);
        const { address: inboundAddress } = await this._getInboundDataByChain(
          !asset.isSynth ? asset.chain : Chain.THORChain,
        );

        return this.deposit({
          feeOptionKey,
          recipient: inboundAddress,
          router: route.contract,
          assetAmount: amount,
          memo: replacedMemo,
        });
      }

      case QuoteMode.AVAX_TO_ETH:
      case QuoteMode.AVAX_TO_TC_SUPPORTED:
      case QuoteMode.ETH_TO_AVAX:
      case QuoteMode.ETH_TO_TC_SUPPORTED: {
        const { getProvider, toChecksumAddress } = await import('@thorswap-lib/toolbox-evm');
        const walletMethods = this.connectedWallets[evmChain];
        const from = this.getAddress(evmChain);

        if (!walletMethods?.sendTransaction || !from) {
          throw new Error(`Wallet is missing for ${evmChain} Chain.`);
        }

        const provider = getProvider(evmChain);
        const { calldata, contract: contractAddress } = route;
        if (!contractAddress) throw new Error('Contract address not found');

        const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];
        if (!abi) throw new Error(`Contract ABI not found for ${contractAddress}`);

        const contract = walletMethods.createContract?.(contractAddress, abi, provider);
        const tx = await contract.populateTransaction.swapIn(
          ...getSwapInParams({
            toChecksumAddress,
            contractAddress: contractAddress as AGG_CONTRACT_ADDRESS,
            recipient,
            calldata,
          }),
          { from },
        );

        return walletMethods.sendTransaction(tx, feeOptionKey) as Promise<string>;
      }

      case QuoteMode.AVAX_TO_AVAX:
      case QuoteMode.ETH_TO_ETH: {
        const walletMethods = this.connectedWallets[evmChain];
        if (!walletMethods?.sendTransaction) throw new Error('Chain client not found');
        if (!route?.transaction) throw new Error('Transaction in route not found');

        const { data, from, to, value: txValue } = route.transaction;
        const value = !isHexString(txValue)
          ? parseUnits(txValue, 'wei').toHexString()
          : parseInt(txValue, 16) > 0
          ? txValue
          : undefined;

        return walletMethods.sendTransaction(
          {
            value,
            data,
            from,
            to: to.toLowerCase(),
            chainId: parseInt(ChainToChainId[evmChain]),
          },
          feeOptionKey,
        ) as Promise<string>;
      }

      default: {
        throw new Error(`Quote mode ${quoteMode} not supported`);
      }
    }
  };

  approveAsset = (asset: AssetEntity, amount?: AmountWithBaseDenom) =>
    this._approve({ asset, amount }, 'approve');

  approveAssetForContract = (
    asset: AssetEntity,
    contractAddress: string,
    amount?: AmountWithBaseDenom,
  ) => this._approve({ asset, amount, contractAddress }, 'approve');

  getAddress = (chain: Chain) => this.connectedChains[chain]?.address || '';

  getBalance = async (chain: Chain, refresh?: boolean) => {
    if (!this.connectedChains[chain]?.address) return [];
    if (!refresh) return this.connectedChains[chain]?.balance || [];
    const chainData = await this.getWalletByChain(chain);

    return chainData?.balance || [];
  };

  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });

  getExplorerTxUrl = (chain: Chain, txHash: string) => getExplorerTxUrl({ chain, txHash });

  getWallet = <T extends Chain>(chain: Chain) => this.connectedWallets[chain] as WalletMethods[T];

  getWalletByChain = async (chain: Chain) => {
    const address = this.getAddress(chain);
    if (!address) return null;

    const balances = (await this.getWallet(chain)?.getBalance(address)) ?? [
      { asset: getSignatureAssetFor(chain), amount: baseAmount(0, BaseDecimal[chain]) },
    ];

    const balance = balances.map(
      ({ amount, asset }) =>
        new AssetAmount(
          getAssetForBalance(asset),
          new Amount(amount.amount().toString() || '0', AmountType.BASE_AMOUNT, amount.decimal),
        ),
    );

    this.connectedChains[chain] = {
      address,
      balance,
      walletType: this.connectedChains[chain]?.walletType as WalletOption,
    };

    return { ...(this.connectedChains[chain] || {}), balance };
  };

  isAssetApproved = (asset: AssetEntity) => this._approve<boolean>({ asset }, 'checkOnly');

  isAssetApprovedForContract = (
    asset: AssetEntity,
    contractAddress: string,
    amount?: AmountWithBaseDenom,
  ) => this._approve<boolean>({ asset, amount, contractAddress }, 'checkOnly');

  validateAddress = ({ address, chain }: { address: string; chain: Chain }) =>
    this.getWallet(chain)?.validateAddress?.(address);

  transfer = async (params: CoreTxParams & { router?: string }) => {
    const chain = params.assetAmount.asset.L1Chain;
    const walletInstance = this.connectedWallets[chain];

    if (!walletInstance) throw new Error('Chain is not connected');

    const txParams = this._prepareTxParams(params);
    // TODO: fix type
    return walletInstance.transfer(txParams) as Promise<string>;
  };

  deposit = async ({
    assetAmount,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) => {
    const chain = assetAmount.asset.L1Chain;
    const walletInstance = this.connectedWallets[chain];
    if (!walletInstance) throw new Error(`Chain ${chain} is not connected`);

    const params = this._prepareTxParams({ assetAmount, recipient, router, ...rest });

    switch (chain) {
      case Chain.THORChain:
        return recipient === ''
          ? (walletInstance as ThorchainWallet).deposit(params)
          : (walletInstance as ThorchainWallet).transfer(params);
      case Chain.Ethereum:
      case Chain.BinanceSmartChain:
      case Chain.Avalanche: {
        const { getBigNumberFrom, getChecksumAddressFromAsset } = await import(
          '@thorswap-lib/toolbox-evm'
        );

        const { asset } = assetAmount;
        const abi = chain === Chain.Avalanche ? TCAvalancheDepositABI : TCEthereumVaultAbi;

        return (
          walletInstance as EVMWallet<typeof AVAXToolbox | typeof ETHToolbox | typeof BSCToolbox>
        ).call({
          abi,
          contractAddress:
            router || ((await this._getInboundDataByChain(chain as EVMChain)).router as string),
          funcName: 'depositWithExpiry',
          funcParams: [
            recipient,
            getChecksumAddressFromAsset(asset, asset?.chain as EVMChain),
            params.amount.amount().toString(),
            params.memo,
            new Date().setMinutes(new Date().getMinutes() + 10),
          ],
          txOverrides: {
            from: params.from,
            value: getBigNumberFrom(
              isGasAsset(assetAmount.asset) ? params.amount.amount().toString() : 0,
            ).toHexString(),
          },
        }) as Promise<string>;
      }
      default:
        return walletInstance.transfer(params) as Promise<string>;
    }
  };

  /**
   * TC related Methods
   */
  createLiquidity = async ({ runeAmount, assetAmount }: CreateLiquidityParams) => {
    if (runeAmount.lte(0) || assetAmount.lte(0)) throw new Error('Amount should be specified');

    return {
      runeTx: await this._depositToPool({
        assetAmount: runeAmount,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetAmount.asset,
          address: this.getAddress(assetAmount.asset.chain),
        }),
      }),
      assetTx: await this._depositToPool({
        assetAmount,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetAmount.asset,
          address: this.getAddress(Chain.THORChain),
        }),
      }),
    };
  };

  addLiquidity = async ({
    pool,
    runeAmount,
    assetAmount,
    runeAddr,
    assetAddr,
    isPendingSymmAsset,
    mode = 'sym',
  }: AddLiquidityParams) => {
    const { chain, symbol } = pool.asset;
    const isSym = mode === 'sym';
    const runeTransfer = runeAmount?.gt(0) && (isSym || mode === 'rune');
    const assetTransfer = assetAmount?.gt(0) && (isSym || mode === 'asset');
    const includeRuneAddress = isPendingSymmAsset || runeTransfer;
    const runeAddress = includeRuneAddress ? runeAddr || this.getAddress(Chain.THORChain) : '';
    const assetAddress = isSym || mode === 'asset' ? assetAddr || this.getAddress(chain) : '';

    if (!runeTransfer && !assetTransfer) throw new Error('Invalid Asset Amount or Mode');
    if (includeRuneAddress && !runeAddress) throw new Error('Rune address not found');

    let runeTx, assetTx;

    if (runeTransfer && runeAmount) {
      try {
        runeTx = await this._depositToPool({
          assetAmount: runeAmount,
          memo: getMemoFor(MemoType.DEPOSIT, {
            chain,
            symbol,
            address: assetAddress,
          }),
        });
      } catch (error) {
        console.error(error);
        runeTx = 'failed';
      }
    }

    if (assetTransfer && assetAmount) {
      try {
        assetTx = await this._depositToPool({
          assetAmount: assetAmount,
          memo: getMemoFor(MemoType.DEPOSIT, {
            chain,
            symbol,
            address: runeAddress,
          }),
        });
      } catch (error) {
        console.error(error);
        assetTx = 'failed';
      }
    }

    return { runeTx, assetTx };
  };

  withdraw = async ({ asset, percent, from, to }: WithdrawParams) => {
    const targetAsset =
      to === 'rune'
        ? getSignatureAssetFor(Chain.THORChain)
        : (from === 'sym' && to === 'sym') || from === 'rune' || from === 'asset'
        ? undefined
        : asset;

    return this._depositToPool({
      assetAmount: getMinAmountByChain(from === 'asset' ? asset.chain : Chain.THORChain),
      memo: getMemoFor(MemoType.WITHDRAW, {
        ...asset,
        basisPoints: percent.mul(100).assetAmount.toNumber(),
        targetAssetString: targetAsset?.toString(),
        singleSide: false,
      }),
    });
  };

  addSavings = (assetAmount: AssetAmount) =>
    this._depositToPool({
      assetAmount,
      memo: getMemoFor(MemoType.DEPOSIT, {
        chain: assetAmount.asset.chain,
        symbol: assetAmount.asset.symbol,
        singleSide: true,
      }),
    });

  withdrawSavings = ({ asset, percent }: { asset: AssetEntity; percent: Amount }) =>
    this._depositToPool({
      assetAmount: getMinAmountByChain(asset.chain),
      memo: getMemoFor(MemoType.WITHDRAW, {
        ...asset,
        basisPoints: percent.mul(100).assetAmount.toNumber(),
        singleSide: true,
      }),
    });

  openLoan = ({
    assetAmount,
    assetTicker,
    borrowAmount,
    memo,
  }: {
    assetAmount: AssetAmount;
    assetTicker: string;
    borrowAmount?: Amount;
    memo?: string;
  }) =>
    this._depositToPool({
      assetAmount,
      memo:
        memo ||
        getMemoFor(MemoType.OPEN_LOAN, {
          asset: assetTicker,
          minAmount: borrowAmount?.assetAmount.toString(),
          address: this.getAddress(assetTicker.split('.')[0] as Chain),
        }),
    });

  closeLoan = ({
    assetAmount,
    assetTicker,
    borrowAmount,
    memo,
  }: {
    assetAmount: AssetAmount;
    assetTicker: string;
    borrowAmount?: Amount;
    memo?: string;
  }) =>
    this._depositToPool({
      assetAmount,
      memo:
        memo ||
        getMemoFor(MemoType.CLOSE_LOAN, {
          asset: assetTicker,
          minAmount: borrowAmount?.assetAmount.toString(),
          address: this.getAddress(assetTicker.split('.')[0] as Chain),
        }),
    });

  registerThorname = (param: ThornameRegisterParam, amount: Amount) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.THORNAME_REGISTER, param),
      assetAmount: new AssetAmount(getSignatureAssetFor(Chain.THORChain), amount),
    });

  bond = (address: string, amount: Amount) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.BOND, { address }),
      assetAmount: new AssetAmount(getSignatureAssetFor(Chain.THORChain), amount),
    });

  unbond = (address: string, unbondAmount: number) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.UNBOND, { address, unbondAmount }),
      assetAmount: getMinAmountByChain(Chain.THORChain),
    });

  leave = (address: string) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.LEAVE, { address }),
      assetAmount: getMinAmountByChain(Chain.THORChain),
    });

  /**
   * Wallet connection methods
   */
  connectXDEFI = async (_chains: Chain[]) => {
    throwWalletError('connectXDEFI', 'xdefi');
  };
  connectEVMWallet = async (_chains: Chain[] | Chain, _wallet: EVMWalletOptions) => {
    throwWalletError('connectEVMWallet', 'evm-web3-wallets');
  };
  connectWalletconnect = async (_chains: Chain[], _options?: any) => {
    throwWalletError('connectWalletconnect', 'walletconnect');
  };
  connectKeystore = async (_chains: Chain[], _phrase: string) => {
    throwWalletError('connectKeystore', 'keystore');
  };
  connectLedger = async (_chains: Chain, _derivationPath: number[]) => {
    throwWalletError('connectLedger', 'ledger');
  };
  connectTrezor = async (_chains: Chain, _derivationPath: number[]) => {
    throwWalletError('connectTrezor', 'trezor');
  };
  connectKeplr = async () => {
    throwWalletError('connectKeplr', 'keplr');
  };
  connectOkx = async (_chains: Chain[]) => {
    throwWalletError('connectOkx', 'okx');
  };
  disconnectChain = (chain: Chain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  extend = ({ wallets, config, apis = {}, rpcUrls = {} }: ExtendParams<T>) => {
    wallets.forEach((wallet) => {
      // @ts-expect-error
      this[wallet.connectMethodName] = wallet.connect({
        addChain: this._addConnectedChain,
        config: config || {},
        apis,
        rpcUrls,
      });
    });
  };

  estimateMaxSendableAmount = ({
    chain,
    params,
  }: {
    chain: Chain;
    params:
      | UTXOMaxSendableAmountParams
      | EVMMaxSendableAmountsParams
      | CosmosMaxSendableAmountParams;
  }): Promise<AmountWithBaseDenom> => {
    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.BinanceSmartChain:
      case Chain.Ethereum:
      case Chain.Optimism:
      case Chain.Polygon:
        return evmEstimateMax(params as EVMMaxSendableAmountsParams);

      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Litecoin:
        return utxoEstimateMax(params as UTXOMaxSendableAmountParams);

      case Chain.Binance:
      case Chain.THORChain:
      case Chain.Cosmos:
        return cosmosEstimateMax(params as CosmosMaxSendableAmountParams);

      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  };

  /**
   * Private methods (internal use only ¯\_(ツ)_/¯)
   */
  private _getInboundDataByChain = async (chain: Chain) => {
    if (chain === Chain.THORChain) {
      return { gas_rate: '0', router: '0', address: '', halted: false, chain: Chain.THORChain };
    }
    const inboundData = await getInboundData(this.stagenet);
    const chainAddressData = inboundData.find((item) => item.chain === chain);

    if (!chainAddressData) throw new Error('pool address not found');
    if (chainAddressData?.halted) {
      throw new Error('Network temporarily halted, please try again later.');
    }

    return chainAddressData;
  };

  private _addConnectedChain = ({ chain, wallet, walletMethods }: AddChainWalletParams) => {
    this.connectedChains[chain] = wallet;
    this.connectedWallets[chain] = walletMethods;
  };

  private _approve = async <T = string>(
    {
      asset,
      contractAddress,
      amount,
    }: { asset: AssetEntity; contractAddress?: string; amount?: AmountWithBaseDenom },
    type: 'checkOnly' | 'approve' = 'checkOnly',
  ) => {
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(
      asset.chain,
    );
    const isNativeEVM = isEVMChain && isGasAsset(asset);
    if (isNativeEVM || !isEVMChain || asset.isSynth) return true;

    const walletMethods = this.connectedWallets[asset.L1Chain as EVMChain];
    const walletAction = type === 'checkOnly' ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) {
      throw new Error(`Wallet not connected for ${asset.L1Chain}`);
    }

    const { getTokenAddress } = await import('@thorswap-lib/toolbox-evm');
    const assetAddress = getTokenAddress(asset, asset.L1Chain as EVMChain);
    // TODO: I dont think we need this @towan
    // We could use the signer in the approve method of the toolbox @chillios
    const from = this.getAddress(asset.L1Chain);

    if (!assetAddress || !from) throw new Error('Asset address && from address not found');

    return walletAction({
      amount: amount?.amount(),
      assetAddress,
      from,
      spenderAddress:
        contractAddress || ((await this._getInboundDataByChain(asset.L1Chain)).router as string),
    }) as Promise<T>;
  };

  private _depositToPool = async ({
    assetAmount,
    memo,
    feeOptionKey = FeeOption.Fast,
  }: {
    assetAmount: AssetAmount;
    memo: string;
    feeOptionKey?: FeeOption;
  }) => {
    const {
      gas_rate,
      router,
      address: poolAddress,
    } = await this._getInboundDataByChain(assetAmount.asset.chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[feeOptionKey];

    return this.deposit({ assetAmount, recipient: poolAddress, memo, router, feeRate });
  };

  private _thorchainTransfer = async ({
    memo,
    assetAmount,
  }: {
    assetAmount: AssetAmount;
    memo: string;
  }) => {
    const mimir = await getMimirData(this.stagenet);

    // check if trading is halted or not
    if (mimir['HALTCHAINGLOBAL'] === 1 || mimir['HALTTHORCHAIN'] === 1) {
      throw new Error('THORChain network is halted now, please try again later.');
    }

    return this.deposit({ assetAmount, recipient: '', memo });
  };

  private _prepareTxParams = ({
    assetAmount: {
      asset: { L1Chain, isSynth, chain, symbol, decimal },
      amount,
    },
    ...restTxParams
  }: CoreTxParams & { router?: string }) => {
    const amountWithBaseDenom = baseAmount(amount.baseAmount.toString(10), decimal);

    const asset = assetFromString(
      isSynth
        ? `${Chain.THORChain}.${chain.toLowerCase()}/${symbol.toLowerCase()}`
        : `${chain.toUpperCase()}.${symbol.toUpperCase()}`,
    );

    return {
      ...restTxParams,
      memo: restTxParams.memo || '',
      from: this.getAddress(L1Chain),
      amount: amountWithBaseDenom,
      asset,
    };
  };
}
