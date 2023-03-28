import { BigNumber } from '@ethersproject/bignumber';
import { isHexString } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import type {
  CalldataSwapIn,
  CalldataSwapOut,
  CalldataTcToTc,
} from '@thorswap-lib/cross-chain-api-sdk/lib/entities';
import { baseAmount, createAssetObjFromAsset, throwWalletError } from '@thorswap-lib/helpers';
import { Midgard } from '@thorswap-lib/midgard-sdk';
import {
  Amount,
  AmountType,
  AssetAmount,
  AssetEntity,
  getMemoFor,
  MemoType,
  Percent,
  ThornameRegisterParam,
} from '@thorswap-lib/swapkit-entities';
import { getExplorerAddressUrl, getExplorerTxUrl } from '@thorswap-lib/swapkit-explorers';
import { getCheckSumAddress, getProvider, getTokenAddress } from '@thorswap-lib/toolbox-evm';
import {
  AmountWithBaseDenom,
  Chain,
  EVMChain,
  EVMWalletOptions,
  FeeOption,
  TCAvalancheDepositABI,
  TCEthereumVaultAbi,
  TxHistoryParams,
} from '@thorswap-lib/types';
import { type WalletConnectOption } from '@thorswap-lib/walletconnect';

import {
  AGG_CONTRACT_ADDRESS,
  lowercasedContractAbiMapping,
} from '../aggregator/contracts/index.js';
import { getSwapInParams } from '../aggregator/getSwapInParams.js';

import { getAssetForBalance, getFeeRate, removeAddressPrefix } from './helpers.js';
import {
  AddChainWalletParams,
  AddLiquidityParams,
  CreateLiquidityParams,
  ExtendParams,
  QuoteMode,
  SwapParams,
  TxParams,
  UpgradeParams,
  Wallet,
  WalletMethods,
  WithdrawParams,
} from './types.js';

const getEmptyWalletStructure = () => ({
  [Chain.Avalanche]: null,
  [Chain.Binance]: null,
  [Chain.BinanceSmartChain]: null,
  [Chain.BitcoinCash]: null,
  [Chain.Bitcoin]: null,
  [Chain.Cosmos]: null,
  [Chain.Doge]: null,
  [Chain.Ethereum]: null,
  [Chain.Litecoin]: null,
  [Chain.THORChain]: null,
});

export class SwapKitCore {
  public connectedChains: Wallet = getEmptyWalletStructure();
  public connectedWallets: Record<Chain, WalletMethods | null> = getEmptyWalletStructure();
  public readonly midgard: Midgard;
  public readonly stagenet: boolean = false;

  constructor({
    midgardUrl: url,
    stagenet,
  }: { stagenet?: boolean; midgardUrl?: string } | undefined = {}) {
    this.stagenet = !!stagenet;
    this.midgard = new Midgard({ network: this.stagenet ? 'stagenet' : 'mainnet', url });
  }

  /**
   * Wallet connection methods
   */
  connectXDEFI = async (_chains: Chain[]) => {
    throwWalletError('connectXDEFI', 'web-extensions');
  };
  connectEVMWallet = async (_chains: Chain[] | Chain, _wallet: EVMWalletOptions) => {
    throwWalletError('connectEVMWallet', 'web-extensions');
  };
  connectWalletconnect = async (_chains: Chain[], _options?: WalletConnectOption) => {
    throwWalletError('connectWalletconnect', 'walletconnect');
  };
  connectKeystore = async (_chains: Chain[], _phrase: string) => {
    throwWalletError('connectKeystore', 'keystore');
  };
  connectLedger = async (_chains: Chain, _derivationPath: number[]) => {
    throwWalletError('connectLedger', 'ledger');
  };
  connectKeplr = async () => {
    throwWalletError('connectKeplr', 'web-extensions');
  };

  extend = ({ wallets, config }: ExtendParams) => {
    wallets.forEach((wallet) => {
      this[wallet.connectMethodName] = wallet.connect({
        addChain: this._addConnectedChain,
        config: config || {},
      });
    });
  };

  disconnectChain = (chain: Chain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  approveAsset = (asset: AssetEntity) => this._approve({ asset }, 'approve');
  getAddress = (chain: Chain) => this.connectedChains[chain]?.address || '';
  getWallet = (chain: Chain) => this.connectedWallets[chain];
  getWalletAddressByChain = (chain: Chain) => removeAddressPrefix(this.getAddress(chain));
  isAssetApproved = (asset: AssetEntity) => this._approve({ asset }, 'checkOnly');
  isAssetApprovedForContract = (asset: AssetEntity, contractAddress: string) =>
    this._approve({ asset, contractAddress }, 'checkOnly');
  approveAssetForContract = (asset: AssetEntity, contractAddress: string) =>
    this._approve({ asset, contractAddress }, 'approve');

  getWalletByChain = async (chain: Chain) => {
    const address = this.getAddress(chain);

    if (!address) return null;
    const balances = (await this.getWallet(chain)?.getBalance(address)) ?? [];
    const balance = balances.map(
      ({ amount, asset }) =>
        new AssetAmount(
          getAssetForBalance(asset),
          new Amount(amount.amount().toString() || '0', AmountType.BASE_AMOUNT, amount.decimal),
        ),
    );

    return { ...(this.connectedChains[chain] || {}), balance };
  };

  validateAddress = ({ address, chain }: { address: string; chain: Chain }) =>
    this.getWallet(chain)?.validateAddress?.(address);

  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });

  getExplorerTxUrl = (chain: Chain, txHash: string) => {
    const txID =
      chain === Chain.Doge
        ? txHash?.toLowerCase()
        : [Chain.Ethereum, Chain.Avalanche].includes(chain) && !txHash.startsWith('0x')
        ? `0x${txHash}`
        : txHash;

    return getExplorerTxUrl({ chain, txID });
  };

  getTransactions = (chain: Chain, params?: TxHistoryParams) => {
    const walletMethods = this.connectedWallets[chain];
    if (!walletMethods || !params) throw new Error('invalid chain');

    return walletMethods.getTransactions(params);
  };

  getTransactionData = (chain: Chain, txHash: string) => {
    const address = this.getAddress(chain);
    if (!address) return;

    return this.connectedWallets[chain]?.getTransactionData(txHash, address);
  };

  getFees = (chain: Chain, tx?: TxParams) => {
    const walletMethods = this.connectedWallets[chain];
    if (!walletMethods) throw new Error('invalid chain');

    if (chain !== Chain.Ethereum) return walletMethods.getFees();

    if (tx && this.connectedWallets.ETH) {
      const {
        assetAmount: { asset, amount },
        recipient,
      } = tx;

      return this.connectedWallets.ETH.getFees({
        asset,
        amount: baseAmount(amount.baseAmount.toString(10), asset.decimal),
        recipient,
      });
    }
  };

  _prepareTxParams = ({
    assetAmount: { asset, amount },
    recipient,
    router,
    feeRate,
    ...rest
  }: TxParams & { router?: string }) => {
    const amountWithBaseDenom = baseAmount(amount.baseAmount.toString(10), asset.decimal);

    return {
      ...rest,
      from: this.getAddress(asset.L1Chain),
      feeRate,
      amount: amountWithBaseDenom,
      asset: createAssetObjFromAsset(asset),
      recipient,
      router,
    };
  };

  transfer = async (params: TxParams & { router?: string }) => {
    const chain = params.assetAmount.asset.L1Chain;

    const walletInstance = this.connectedWallets[chain];

    if (!walletInstance) throw new Error('Chain is not connected');

    const txParams = this._prepareTxParams(params);

    return walletInstance.transfer(txParams);
  };

  deposit = async ({ assetAmount, recipient, router, ...rest }: TxParams & { router?: string }) => {
    const chain = assetAmount.asset.L1Chain;

    const isL1Deposit = chain === Chain.THORChain && recipient === '';
    const isEVMDeposit = [Chain.Avalanche, Chain.Ethereum].includes(chain);

    const walletInstance = this.connectedWallets[chain];

    if (!walletInstance) throw new Error('Chain is not connected');

    const params = this._prepareTxParams({
      assetAmount,
      recipient,
      router,
      ...rest,
    });

    if (isL1Deposit) return walletInstance.deposit(params);

    if (isEVMDeposit) {
      const { asset } = assetAmount;
      const abi = chain === Chain.Avalanche ? TCAvalancheDepositABI : TCEthereumVaultAbi;

      return walletInstance.call({
        abi,
        contractAddress:
          router || ((await this._getInboundDataByChain(chain as EVMChain)).router as string),
        funcName: 'depositWithExpiry',
        funcParams: [
          recipient,
          getCheckSumAddress(asset, asset?.chain as EVMChain),
          params.amount.amount().toString(),
          params.memo,
          new Date().setMinutes(new Date().getMinutes() + 10),
          {
            from: params.from,
            value: BigNumber.from(
              assetAmount.asset.isGasAsset() ? params.amount.amount().toString() : 0,
            ).toHexString(),
          },
        ],
      }) as Promise<string>;
    }

    return walletInstance.transfer(params);
  };

  swap = async ({ quoteMode, recipient, route, feeOptionKey }: SwapParams) => {
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
        const { fromAsset, amountIn, memo } = route.calldata as CalldataSwapOut | CalldataTcToTc;
        const asset = AssetEntity.fromAssetString(fromAsset);
        if (!asset) throw new Error('Asset not recognised');

        const amount = new AssetAmount(asset, new Amount(amountIn, 0, asset.decimal));
        const replacedMemo = memo.replace('{recipientAddress}', recipient);
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
        const walletMethods = this.connectedWallets[evmChain];
        const from = this.getAddress(evmChain);
        if (!walletMethods?.sendTransaction || !from) throw new Error('Chain client not found');
        const { calldata, contract: contractAddress } = route as {
          calldata: CalldataSwapIn;
          contract: AGG_CONTRACT_ADDRESS;
        };
        const provider = getProvider(evmChain);
        const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];

        if (!abi) throw new Error('[swapIn]: Could not find contract ABI');

        const params = getSwapInParams({ contractAddress, recipient, calldata });

        const contract = new Contract(contractAddress, abi, provider);
        const tx = await contract.populateTransaction.swapIn(...params, { from });
        return walletMethods.sendTransaction(tx, feeOptionKey);
      }

      case QuoteMode.AVAX_TO_AVAX:
      case QuoteMode.ETH_TO_ETH: {
        const walletMethods = this.connectedWallets[evmChain];
        if (!walletMethods?.sendTransaction) throw new Error('Chain client not found');
        if (!route?.transaction) throw new Error('Transaction in route not found');

        const { transaction } = route;

        const value = !isHexString(transaction.value)
          ? parseUnits(transaction.value, 'wei').toHexString()
          : parseInt(transaction.value, 16) > 0
          ? transaction.value
          : undefined;

        const params = {
          value,
          data: transaction.data,
          from: transaction.from,
          to: transaction.to.toLowerCase(),
        };

        return walletMethods.sendTransaction(params, feeOptionKey);
      }

      default: {
        throw new Error(`Quote mode ${quoteMode} not supported`);
      }
    }
  };

  /**
   * TC related Methods
   */
  createLiquidity = async ({ runeAmount, assetAmount }: CreateLiquidityParams) => {
    if (runeAmount.lte(0) || assetAmount.lte(0)) throw new Error('Amount should be specified');

    const { asset } = assetAmount;
    const { chain, symbol } = asset;
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);
    const feeRate = getFeeRate({ gasRate: gas_rate, feeOptionKey: FeeOption.Fast });

    return {
      runeTx: await this.deposit({
        assetAmount: runeAmount,
        recipient: '',
        memo: getMemoFor(MemoType.DEPOSIT, {
          chain,
          symbol,
          address: this.getWalletAddressByChain(chain),
        }),
        feeRate,
      }),
      assetTx: await this.deposit({
        assetAmount,
        recipient: address,
        memo: getMemoFor(MemoType.DEPOSIT, {
          chain,
          symbol,
          address: this.getWalletAddressByChain(Chain.THORChain),
        }),
        router,
        feeRate,
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
  }: AddLiquidityParams) => {
    const { chain, symbol } = pool.asset;
    const runeTransfer = runeAmount?.gt(0);
    const assetTransfer = assetAmount?.gt(0);
    if (!runeTransfer && !assetTransfer) throw new Error('Invalid Asset Amount');
    const includeRuneAddress = isPendingSymmAsset || runeTransfer;
    const runeAddress = includeRuneAddress
      ? runeAddr || this.getWalletAddressByChain(Chain.THORChain)
      : '';

    const { address, gas_rate, router } = await this._getInboundDataByChain(chain);
    const feeRate = getFeeRate({ gasRate: gas_rate, feeOptionKey: FeeOption.Fast });
    const runeMemo = getMemoFor(MemoType.DEPOSIT, {
      chain,
      symbol,
      address: assetAddr || this.getWalletAddressByChain(chain),
    });
    const assetMemo = getMemoFor(MemoType.DEPOSIT, {
      chain,
      symbol,
      address: runeAddress,
    });

    if (includeRuneAddress && !runeAddress) throw new Error('Rune address not found');

    return {
      runeTx: runeTransfer
        ? await this.deposit({
            assetAmount: runeAmount as AssetAmount,
            recipient: '',
            memo: runeMemo,
            feeRate,
          })
        : undefined,
      assetTx: assetTransfer
        ? await this.deposit({
            assetAmount: assetAmount as AssetAmount,
            recipient: address,
            memo: assetMemo,
            router,
            feeRate,
          })
        : undefined,
    };
  };

  withdraw = async ({ pool: { asset }, percent, from, to }: WithdrawParams) => {
    const targetAsset =
      to === 'rune'
        ? AssetEntity.RUNE()
        : (from === 'sym' && to === 'sym') || from === 'rune' || from === 'asset'
        ? undefined
        : asset;

    // get inbound address for asset chain
    const chain = from === 'asset' ? asset.chain : Chain.THORChain;
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);

    return this.deposit({
      assetAmount: AssetAmount.getMinAmountByChain(chain),
      recipient: address,
      memo: getMemoFor(MemoType.WITHDRAW, {
        chain: asset.chain,
        ticker: asset.ticker,
        symbol: asset.symbol,
        basisPoints: percent.mul(100).assetAmount.toNumber(),
        targetAssetString: targetAsset?.toString(),
        singleSide: false,
      }),
      router: from === 'asset' ? router : undefined,
      feeRate: getFeeRate({ gasRate: gas_rate, feeOptionKey: FeeOption.Fast }),
    });
  };

  addSavings = (assetAmount: AssetAmount) =>
    this._transferToPool({
      assetAmount,
      chain: assetAmount.asset.chain,
      memo: getMemoFor(MemoType.DEPOSIT, {
        chain: assetAmount.asset.chain,
        symbol: assetAmount.asset.symbol,
        singleSide: true,
      }),
    });

  withdrawSavings = ({
    asset: { ticker, chain, symbol },
    percent,
  }: {
    asset: AssetEntity;
    percent: Percent;
  }) =>
    this._transferToPool({
      chain,
      assetAmount: AssetAmount.getMinAmountByChain(chain),
      memo: getMemoFor(MemoType.WITHDRAW, {
        chain,
        ticker,
        symbol,
        basisPoints: percent.mul(100).assetAmount.toNumber(),
        singleSide: true,
      }),
    });

  registerThorname = (param: ThornameRegisterParam, amount: Amount) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.THORNAME_REGISTER, param),
      assetAmount: new AssetAmount(AssetEntity.RUNE(), amount),
    });

  bond = (address: string, amount: Amount) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.BOND, { address }),
      assetAmount: new AssetAmount(AssetEntity.RUNE(), amount),
    });

  unbond = (address: string, unbondAmount: number) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.UNBOND, { address, unbondAmount: unbondAmount }),
      assetAmount: AssetAmount.getMinAmountByChain(Chain.THORChain),
    });

  leave = (address: string) =>
    this._thorchainTransfer({
      memo: getMemoFor(MemoType.LEAVE, { address }),
      assetAmount: AssetAmount.getMinAmountByChain(Chain.THORChain),
    });

  /**
   * remove after KillSwitch
   */
  upgrade = async ({ runeAmount, recipient }: UpgradeParams) => {
    const { chain } = runeAmount.asset;
    const isETH = chain === Chain.Ethereum;
    if (!recipient) throw new Error('rune wallet not found');
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);

    if (isETH && !router) throw new Error('upgrade failed');

    return this.deposit({
      router: isETH ? router : undefined,
      assetAmount: runeAmount,
      recipient: address,
      memo: getMemoFor(MemoType.UPGRADE, { address }),
      feeRate: getFeeRate({ gasRate: gas_rate, feeOptionKey: FeeOption.Fast }),
    });
  };

  /**
   * Private methods (internal use only ¯\_(ツ)_/¯)
   */
  private _getInboundDataByChain = async (chain: Chain, skipThrow: boolean = false) => {
    if (chain === Chain.THORChain) {
      return { address: '', halted: false, chain: Chain.THORChain, pub_key: '' };
    }

    const inboundData = await this.midgard.getInboundAddresses();
    const addresses = inboundData || [];
    const chainAddressData = addresses.find((item) => item.chain === chain);
    if (chainAddressData) {
      if (chainAddressData.halted && !skipThrow) {
        throw new Error('Network temporarily halted, please try again later.');
      }

      return chainAddressData;
    } else {
      throw new Error('pool address not found');
    }
  };

  private _addConnectedChain = ({ chain, wallet, walletMethods }: AddChainWalletParams) => {
    this.connectedChains[chain] = wallet;
    this.connectedWallets[chain] = walletMethods;
  };

  private _approve = async (
    {
      asset,
      contractAddress,
      amount,
    }: { asset: AssetEntity; contractAddress?: string; amount?: AmountWithBaseDenom },
    type: 'checkOnly' | 'approve' = 'checkOnly',
  ) => {
    const isNativeEVM = asset.isETH() || asset.isAVAX();
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche].includes(asset.chain);
    if (isNativeEVM || !isEVMChain || asset.isSynth) return true;

    const walletMethods = this.connectedWallets[asset.L1Chain];
    const walletAction = type === 'checkOnly' ? walletMethods?.isApproved : walletMethods?.approve;

    const assetAddress = getTokenAddress(asset, asset.L1Chain as EVMChain);
    // TODO: I dont think we need this @towan
    const from = this.getAddress(asset.L1Chain);
    // if no amount is set use minimum amount for isApproved check

    if (!assetAddress || !walletAction || !from) return;

    return walletAction({
      amount,
      assetAddress,
      from,
      spenderAddress:
        contractAddress || ((await this._getInboundDataByChain(asset.L1Chain)).router as string),
    });
  };

  private _transferToPool = async ({
    assetAmount,
    memo,
    chain,
  }: {
    assetAmount: AssetAmount;
    memo: string;
    chain: Chain;
  }) => {
    const { gas_rate, router, address: poolAddress } = await this._getInboundDataByChain(chain);
    const feeRate = getFeeRate({ gasRate: gas_rate, feeOptionKey: FeeOption.Fast });

    return this.deposit({ assetAmount, recipient: poolAddress, memo, router, feeRate });
  };

  private _thorchainTransfer = async ({
    memo,
    assetAmount,
  }: {
    assetAmount: AssetAmount;
    memo: string;
  }) => {
    const mimir = await this.midgard.getThorchainMimir();
    const haltKey = `HALT${Chain.THORChain}CHAIN`;

    // check if trading is halted or not
    if (mimir[haltKey] === 1) {
      throw new Error('THORChain network is halted now, please try again later.');
    }

    return this.deposit({ assetAmount, recipient: '', memo });
  };
}
