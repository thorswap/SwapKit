import { assetFromString, baseAmount, gasFeeMultiplier, SwapKitError } from '@thorswap-lib/helpers';
import type { ThornameRegisterParam } from '@thorswap-lib/swapkit-entities';
import {
  Amount,
  AmountType,
  AssetAmount,
  AssetEntity,
  getMemoFor,
  getMinAmountByChain,
  getSignatureAssetFor,
  isGasAsset,
} from '@thorswap-lib/swapkit-entities';
import type {
  CosmosLikeToolbox,
  CosmosMaxSendableAmountParams,
} from '@thorswap-lib/toolbox-cosmos';
import type {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  EVMMaxSendableAmountsParams,
  EVMToolbox,
} from '@thorswap-lib/toolbox-evm';
import type { UTXOEstimateFeeParams, UTXOToolbox } from '@thorswap-lib/toolbox-utxo';
import type {
  AddChainWalletParams,
  AmountWithBaseDenom,
  EVMChain,
  EVMWalletOptions,
  ExtendParams,
  WalletOption,
} from '@thorswap-lib/types';
import {
  AGG_SWAP,
  BaseDecimal,
  Chain,
  FeeOption,
  MemoType,
  SWAP_IN,
  SWAP_OUT,
  TCAvalancheDepositABI,
  TCBscDepositABI,
  TCEthereumVaultAbi,
} from '@thorswap-lib/types';

import type { AGG_CONTRACT_ADDRESS } from '../aggregator/contracts/index.ts';
import { lowercasedContractAbiMapping } from '../aggregator/contracts/index.ts';
import {
  getSameEVMParams,
  getSwapInParams,
  getSwapOutParams,
} from '../aggregator/getSwapParams.ts';

import {
  getAssetForBalance,
  getEmptyWalletStructure,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getInboundData,
  getMimirData,
} from './helpers.ts';
import type {
  AddLiquidityParams,
  CoreTxParams,
  CreateLiquidityParams,
  EVMWallet,
  SwapParams,
  ThorchainWallet,
  Wallet,
  WalletMethods,
  WithdrawParams,
} from './types.ts';

export class SwapKitCore<T = ''> {
  public connectedChains: Wallet = getEmptyWalletStructure();
  public connectedWallets: WalletMethods = getEmptyWalletStructure();
  public readonly stagenet: boolean = false;

  constructor({ stagenet }: { stagenet?: boolean } | undefined = {}) {
    this.stagenet = !!stagenet;
  }

  getAddress = (chain: Chain) => this.connectedChains[chain]?.address || '';
  getExplorerTxUrl = (chain: Chain, txHash: string) => getExplorerTxUrl({ chain, txHash });
  getWallet = <T extends Chain>(chain: Chain) => this.connectedWallets[chain] as WalletMethods[T];
  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });
  getBalance = async (chain: Chain, refresh?: boolean) => {
    if (!refresh) return this.connectedChains[chain]?.balance || [];
    return (await this.getWalletByChain(chain))?.balance || [];
  };

  swap = async ({ streamSwap, recipient, route, feeOptionKey }: SwapParams) => {
    const { quoteMode } = route.meta;
    const evmChain = quoteMode.startsWith('ERC20-')
      ? Chain.Ethereum
      : quoteMode.startsWith('ARC20-')
      ? Chain.Avalanche
      : Chain.BinanceSmartChain;

    if (!route.complete) throw new SwapKitError('core_swap_route_not_complete');

    try {
      if (AGG_SWAP.includes(quoteMode)) {
        const walletMethods = this.connectedWallets[evmChain];
        if (!walletMethods?.sendTransaction) {
          throw new SwapKitError('core_wallet_connection_not_found');
        }

        const transaction = streamSwap ? route?.streamingSwap?.transaction : route?.transaction;
        if (!transaction) throw new SwapKitError('core_swap_route_transaction_not_found');

        return walletMethods.sendTransaction(
          getSameEVMParams({ transaction, evmChain }),
          feeOptionKey,
        ) as Promise<string>;
      }

      if (SWAP_OUT.includes(quoteMode)) {
        const asset = AssetEntity.fromAssetString(route.calldata.fromAsset);
        if (!asset) throw new SwapKitError('core_swap_asset_not_recognized');
        const { address } = await this._getInboundDataByChain(asset.L1Chain);

        return this.deposit({
          ...getSwapOutParams({ recipient, streamSwap, callData: route.calldata }),
          feeOptionKey,
          router: route.contract,
          recipient: address,
        });
      }

      if (SWAP_IN.includes(quoteMode)) {
        const { calldata, contract: contractAddress } = route;
        if (!contractAddress) throw new SwapKitError('core_swap_contract_not_found');

        const walletMethods = this.connectedWallets[evmChain];
        const from = this.getAddress(evmChain);
        if (!walletMethods?.sendTransaction || !from) {
          throw new SwapKitError('core_wallet_connection_not_found');
        }

        const { getProvider, toChecksumAddress } = await import('@thorswap-lib/toolbox-evm');
        const provider = getProvider(evmChain);
        const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];

        if (!abi) throw new SwapKitError('core_swap_contract_not_supported', { contractAddress });

        const contract = walletMethods.createContract?.(contractAddress, abi, provider);

        const tx = await contract.populateTransaction.swapIn(
          ...getSwapInParams({
            streamSwap,
            toChecksumAddress,
            contractAddress: contractAddress as AGG_CONTRACT_ADDRESS,
            recipient,
            calldata,
          }),
          { from },
        );

        return walletMethods.sendTransaction(tx, feeOptionKey) as Promise<string>;
      }

      throw new SwapKitError('core_swap_quote_mode_not_supported', { quoteMode });
    } catch (error) {
      throw new SwapKitError('core_swap_transaction_error', error);
    }
  };

  approveAsset = (asset: AssetEntity, amount?: AmountWithBaseDenom) =>
    this._approve({ asset, amount }, 'approve');

  approveAssetForContract = (
    asset: AssetEntity,
    contractAddress: string,
    amount?: AmountWithBaseDenom,
  ) => this._approve({ asset, amount, contractAddress }, 'approve');

  getWalletByChain = async (chain: Chain) => {
    const address = this.getAddress(chain);
    if (!address) return null;

    const balances = (await this.getWallet(chain)?.getBalance(address)) || [
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

  isAssetApproved = (asset: AssetEntity, amount?: AmountWithBaseDenom) =>
    this._approve<boolean>({ asset, amount }, 'checkOnly');

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

    if (!walletInstance) throw new SwapKitError('core_wallet_connection_not_found');

    const txParams = this._prepareTxParams(params);

    try {
      return await walletInstance.transfer(txParams);
    } catch (error) {
      throw new SwapKitError('core_swap_transaction_error', error);
    }
  };

  deposit = async ({
    assetAmount,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) => {
    const chain = assetAmount.asset.L1Chain;
    const walletInstance = this.connectedWallets[chain];
    if (!walletInstance) throw new SwapKitError('core_wallet_connection_not_found');

    const params = this._prepareTxParams({ assetAmount, recipient, router, ...rest });

    try {
      switch (chain) {
        case Chain.THORChain:
          return await (recipient === ''
            ? (walletInstance as ThorchainWallet).deposit(params)
            : (walletInstance as ThorchainWallet).transfer(params));
        case Chain.Ethereum:
        case Chain.BinanceSmartChain:
        case Chain.Avalanche: {
          const { getBigNumberFrom, getChecksumAddressFromAsset } = await import(
            '@thorswap-lib/toolbox-evm'
          );

          const { asset } = assetAmount;
          const abi =
            chain === Chain.Avalanche
              ? TCAvalancheDepositABI
              : chain === Chain.BinanceSmartChain
              ? TCBscDepositABI
              : TCEthereumVaultAbi;

          return (await (
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
          })) as Promise<string>;
        }

        default: {
          return await walletInstance.transfer(params);
        }
      }
    } catch (error) {
      throw new SwapKitError('core_transaction_deposit_error', error);
    }
  };

  /**
   * TC related Methods
   */
  createLiquidity = async ({ runeAmount, assetAmount }: CreateLiquidityParams) => {
    if (runeAmount.lte(0) || assetAmount.lte(0)) {
      throw new SwapKitError('core_transaction_create_liquidity_invalid_params');
    }

    let runeTx = '';
    let assetTx = '';

    try {
      runeTx = await this._depositToPool({
        assetAmount: runeAmount,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetAmount.asset,
          address: this.getAddress(assetAmount.asset.chain),
        }),
      });
    } catch (error) {
      throw new SwapKitError('core_transaction_create_liquidity_rune_error', error);
    }

    try {
      assetTx = await this._depositToPool({
        assetAmount,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetAmount.asset,
          address: this.getAddress(Chain.THORChain),
        }),
      });
    } catch (error) {
      throw new SwapKitError('core_transaction_create_liquidity_asset_error', error);
    }

    return { runeTx, assetTx };
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

    if (!runeTransfer && !assetTransfer) {
      throw new SwapKitError('core_transaction_add_liquidity_invalid_params');
    }
    if (includeRuneAddress && !runeAddress) {
      throw new SwapKitError('core_transaction_add_liquidity_no_rune_address');
    }

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
        throw new SwapKitError('core_transaction_add_liquidity_rune_error', error);
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
        throw new SwapKitError('core_transaction_add_liquidity_asset_error', error);
      }
    }

    return { runeTx, assetTx };
  };

  withdraw = async ({ memo, asset, percent, from, to }: WithdrawParams) => {
    const targetAsset =
      to === 'rune'
        ? getSignatureAssetFor(Chain.THORChain)
        : (from === 'sym' && to === 'sym') || from === 'rune' || from === 'asset'
        ? undefined
        : asset;

    try {
      const txHash = await this._depositToPool({
        assetAmount: getMinAmountByChain(from === 'asset' ? asset.chain : Chain.THORChain),
        memo:
          memo ||
          getMemoFor(MemoType.WITHDRAW, {
            ...asset,
            basisPoints: percent.mul(100).assetAmount.toNumber(),
            targetAssetString: targetAsset?.toString(),
            singleSide: false,
          }),
      });

      return txHash;
    } catch (error) {
      throw new SwapKitError('core_transaction_withdraw_error', error);
    }
  };

  addSavings = async ({ assetAmount, memo }: { assetAmount: AssetAmount; memo?: string }) => {
    try {
      const txHash = await this._depositToPool({
        assetAmount,
        memo:
          memo ||
          getMemoFor(MemoType.DEPOSIT, {
            chain: assetAmount.asset.chain,
            symbol: assetAmount.asset.symbol,
            singleSide: true,
          }),
      });

      return txHash;
    } catch (error) {
      throw new SwapKitError('core_transaction_deposit_to_pool_error', error);
    }
  };

  withdrawSavings = async ({
    memo,
    asset,
    percent,
  }: {
    memo?: string;
    asset: AssetEntity;
    percent: Amount;
  }) => {
    try {
      const txHash = await this._depositToPool({
        assetAmount: getMinAmountByChain(asset.chain),
        memo:
          memo ||
          getMemoFor(MemoType.WITHDRAW, {
            ...asset,
            basisPoints: percent.mul(100).assetAmount.toNumber(),
            singleSide: true,
          }),
      });

      return txHash;
    } catch (error) {
      throw new SwapKitError('core_transaction_withdraw_error', error);
    }
  };

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
  connectXDEFI = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError('core_wallet_xdefi_not_installed');
  };
  connectEVMWallet = async (_chains: Chain[] | Chain, _wallet: EVMWalletOptions): Promise<void> => {
    throw new SwapKitError('core_wallet_evmwallet_not_installed');
  };
  connectWalletconnect = async (_chains: Chain[], _options?: any): Promise<void> => {
    throw new SwapKitError('core_wallet_walletconnect_not_installed');
  };
  connectKeystore = async (_chains: Chain[], _phrase: string): Promise<void> => {
    throw new SwapKitError('core_wallet_keystore_not_installed');
  };
  connectLedger = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError('core_wallet_ledger_not_installed');
  };
  connectTrezor = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError('core_wallet_trezor_not_installed');
  };
  connectKeplr = async (): Promise<void> => {
    throw new SwapKitError('core_wallet_keplr_not_installed');
  };
  connectOkx = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError('core_wallet_okx_not_installed');
  };
  disconnectChain = (chain: Chain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  extend = ({ wallets, config, apis = {}, rpcUrls = {} }: ExtendParams<T>) => {
    try {
      wallets.forEach((wallet) => {
        // @ts-expect-error
        this[wallet.connectMethodName] = wallet.connect({
          addChain: this._addConnectedChain,
          config: config || {},
          apis,
          rpcUrls,
        });
      });
    } catch (error) {
      throw new SwapKitError('core_extend_error', error);
    }
  };

  estimateMaxSendableAmount = async ({
    chain,
    params,
  }: {
    chain: Chain;
    params: Omit<
      UTXOEstimateFeeParams | EVMMaxSendableAmountsParams | CosmosMaxSendableAmountParams,
      'toolbox'
    >;
  }): Promise<AmountWithBaseDenom> => {
    const walletMethods = this.getWallet<typeof chain>(chain);

    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.BinanceSmartChain:
      case Chain.Ethereum:
      case Chain.Optimism:
      case Chain.Polygon: {
        const { estimateMaxSendableAmount } = await import('@thorswap-lib/toolbox-evm');
        return estimateMaxSendableAmount({ ...params, toolbox: walletMethods as EVMToolbox });
      }

      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Litecoin:
        return (walletMethods as UTXOToolbox).estimateMaxSendableAmount(params);

      case Chain.Binance:
      case Chain.THORChain:
      case Chain.Cosmos: {
        const { estimateMaxSendableAmount } = await import('@thorswap-lib/toolbox-cosmos');
        return estimateMaxSendableAmount({
          ...params,
          toolbox: walletMethods as CosmosLikeToolbox,
        });
      }

      default:
        throw new SwapKitError('core_estimated_max_spendable_chain_not_supported');
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

    if (!chainAddressData) throw new SwapKitError('core_inbound_data_not_found');
    if (chainAddressData?.halted) throw new SwapKitError('core_chain_halted');

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

    if (!walletAction) throw new SwapKitError('core_wallet_connection_not_found');

    const { getTokenAddress } = await import('@thorswap-lib/toolbox-evm');
    const assetAddress = getTokenAddress(asset, asset.L1Chain as EVMChain);
    // TODO: I dont think we need this @towan
    // We could use the signer in the approve method of the toolbox @chillios
    const from = this.getAddress(asset.L1Chain);

    if (!assetAddress || !from)
      throw new SwapKitError('core_approve_asset_address_or_from_not_found');

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
      throw new SwapKitError('core_chain_halted');
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