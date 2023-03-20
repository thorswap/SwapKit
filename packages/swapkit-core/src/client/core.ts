import { isHexString } from '@ethersproject/bytes';
import { parseUnits } from '@ethersproject/units';
import type {
  CalldataSwapIn,
  CalldataSwapOut,
  CalldataTcToTc,
} from '@thorswap-lib/cross-chain-api-sdk/lib/entities';
import {
  baseAmount,
  createAssetObjFromAsset,
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
  MemoType,
  Percent,
  ThornameRegisterParam,
} from '@thorswap-lib/swapkit-entities';
import { getExplorerAddressUrl, getExplorerTxUrl } from '@thorswap-lib/swapkit-explorers';
import {
  AmountWithBaseDenom,
  Chain,
  EVMChain,
  EVMWalletOptions,
  FeeOption,
  SupportedChain,
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

import { getAssetForBalance, getInboundData, getMimirData } from './helpers.js';
import {
  AddChainWalletParams,
  AddLiquidityParams,
  BaseEVMWallet,
  CoreTxParams,
  CreateLiquidityParams,
  ExtendParams,
  QuoteMode,
  SwapParams,
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
  public connectedWallets: WalletMethods = getEmptyWalletStructure();
  public readonly stagenet: boolean = false;

  constructor({ stagenet }: { stagenet?: boolean; midgardUrl?: string } | undefined = {}) {
    this.stagenet = !!stagenet;
  }

  swap = async ({ recipient, route, feeOptionKey }: SwapParams) => {
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
        const { getProvider, toChecksumAddress } = await import('@thorswap-lib/toolbox-evm');
        const walletMethods = this.connectedWallets[evmChain];
        const from = this.getAddress(evmChain);

        if (!walletMethods?.sendTransaction || !from) {
          throw new Error(`Wallet is missing for ${evmChain} Chain.`);
        }

        const provider = getProvider(evmChain);
        const { calldata, contract: contractAddress } = route as {
          calldata: CalldataSwapIn;
          contract: AGG_CONTRACT_ADDRESS;
        };
        const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];
        if (!abi) throw new Error(`Contract ABI not found for ${contractAddress}`);

        const contract = walletMethods.createContract?.(contractAddress, abi, provider);
        const tx = await contract.populateTransaction.swapIn(
          ...getSwapInParams({ toChecksumAddress, contractAddress, recipient, calldata }),
          { from },
        );

        return walletMethods.sendTransaction(tx, feeOptionKey);
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
          { value, data, from, to: to.toLowerCase() },
          feeOptionKey,
        );
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

  getAddress = (chain: SupportedChain) => this.connectedChains[chain]?.address || '';

  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });

  getExplorerTxUrl = (chain: Chain, txHash: string) => getExplorerTxUrl({ chain, txHash });

  getWallet = (chain: SupportedChain) => this.connectedWallets[chain];

  isAssetApproved = (asset: AssetEntity) => this._approve({ asset }, 'checkOnly');

  isAssetApprovedForContract = (asset: AssetEntity, contractAddress: string) =>
    this._approve({ asset, contractAddress }, 'checkOnly');

  validateAddress = ({ address, chain }: { address: string; chain: SupportedChain }) =>
    this.getWallet(chain)?.validateAddress?.(address);

  getWalletByChain = async (chain: SupportedChain) => {
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

  getTransactions = (chain: SupportedChain, params?: TxHistoryParams) => {
    const walletMethods = this.connectedWallets[chain];
    if (!walletMethods) throw new Error(`Chain ${chain} is not connected`);

    return walletMethods.getTransactions(params);
  };

  getTransactionData = (chain: SupportedChain, txHash: string) => {
    const address = this.getAddress(chain);
    if (!address) throw new Error(`Chain ${chain} is not connected`);

    return this.connectedWallets[chain]?.getTransactionData(txHash, address);
  };

  transfer = async (params: CoreTxParams & { router?: string }) => {
    const chain = params.assetAmount.asset.L1Chain as SupportedChain;
    const walletInstance = this.connectedWallets[chain];

    if (!walletInstance) throw new Error('Chain is not connected');

    const txParams = this._prepareTxParams(params);
    return walletInstance.transfer(txParams);
  };

  deposit = async ({
    assetAmount,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) => {
    const chain = assetAmount.asset.L1Chain as SupportedChain;

    const isL1Deposit = chain === Chain.THORChain && recipient === '';
    const isEVMDeposit = [Chain.Avalanche, Chain.Ethereum].includes(chain);

    const walletInstance = this.connectedWallets[chain];

    if (!walletInstance) throw new Error(`Chain ${chain} is not connected`);

    const params = this._prepareTxParams({
      assetAmount,
      recipient,
      router,
      ...rest,
    });

    //@ts-ignore
    if (isL1Deposit) return walletInstance.deposit(params);

    if (isEVMDeposit) {
      const { getBigNumberFrom, getChecksumAddressFromAsset } = await import(
        '@thorswap-lib/toolbox-evm'
      );

      const { asset } = assetAmount;
      const abi = chain === Chain.Avalanche ? TCAvalancheDepositABI : TCEthereumVaultAbi;

      return (walletInstance as BaseEVMWallet).call({
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
          {
            from: params.from,
            value: getBigNumberFrom(
              isGasAsset(assetAmount.asset) ? params.amount.amount().toString() : 0,
            ).toHexString(),
          },
        ],
      }) as Promise<string>;
    }

    return walletInstance.transfer(params);
  };

  /**
   * TC related Methods
   */
  createLiquidity = async ({ runeAmount, assetAmount }: CreateLiquidityParams) => {
    if (runeAmount.lte(0) || assetAmount.lte(0)) throw new Error('Amount should be specified');

    const { asset } = assetAmount;
    const { chain, symbol } = asset;
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[FeeOption.Fast];

    return {
      runeTx: await this.deposit({
        assetAmount: runeAmount,
        recipient: '',
        memo: getMemoFor(MemoType.DEPOSIT, {
          chain,
          symbol,
          address: this.getAddress(chain as SupportedChain),
        }),
        feeRate,
      }),
      assetTx: await this.deposit({
        assetAmount,
        recipient: address,
        memo: getMemoFor(MemoType.DEPOSIT, {
          chain,
          symbol,
          address: this.getAddress(Chain.THORChain),
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
    mode = 'sym',
  }: AddLiquidityParams) => {
    const { chain, symbol } = pool.asset;
    const isSym = mode === 'sym';
    const runeTransfer = runeAmount?.gt(0) && (isSym || mode === 'rune');
    const assetTransfer = assetAmount?.gt(0) && (isSym || mode === 'asset');

    if (!runeTransfer && !assetTransfer) throw new Error('Invalid Asset Amount or Mode');

    const includeRuneAddress = isPendingSymmAsset || runeTransfer;
    const runeAddress = includeRuneAddress ? runeAddr || this.getAddress(Chain.THORChain) : '';

    const { address, gas_rate, router } = await this._getInboundDataByChain(chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[FeeOption.Fast];
    const runeMemo = getMemoFor(MemoType.DEPOSIT, {
      chain,
      symbol,
      address: assetAddr || this.getAddress(chain as SupportedChain),
    });
    const assetMemo = getMemoFor(MemoType.DEPOSIT, {
      chain,
      symbol,
      address: runeAddress,
    });

    if (includeRuneAddress && !runeAddress) throw new Error('Rune address not found');

    let runeTx, assetTx;

    if (runeTransfer) {
      try {
        runeTx = await this.deposit({
          assetAmount: runeAmount as AssetAmount,
          recipient: '',
          memo: runeMemo,
          feeRate,
        });
      } catch (error) {
        console.error(error);
      }
    }

    if (assetTransfer) {
      try {
        assetTx = await this.deposit({
          assetAmount: assetAmount as AssetAmount,
          recipient: address,
          memo: assetMemo,
          router,
          feeRate,
        });
      } catch (error) {
        console.error(error);
      }
    }

    return { runeTx, assetTx };
  };

  withdraw = async ({ pool: { asset }, percent, from, to }: WithdrawParams) => {
    const targetAsset =
      to === 'rune'
        ? getSignatureAssetFor(Chain.THORChain)
        : (from === 'sym' && to === 'sym') || from === 'rune' || from === 'asset'
        ? undefined
        : asset;

    // get inbound address for asset chain
    const chain = from === 'asset' ? asset.chain : Chain.THORChain;
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);

    return this.deposit({
      assetAmount: getMinAmountByChain(chain),
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
      feeRate: (parseInt(gas_rate) || 0) * gasFeeMultiplier[FeeOption.Fast],
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
      assetAmount: getMinAmountByChain(chain),
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
  disconnectChain = (chain: SupportedChain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  extend = ({ wallets, config }: ExtendParams) => {
    wallets.forEach((wallet) => {
      this[wallet.connectMethodName] = wallet.connect({
        addChain: this._addConnectedChain,
        config: config || {},
      });
    });
  };

  /**
   * remove after KillSwitch
   */
  upgrade = async ({ runeAmount, recipient }: UpgradeParams) => {
    const { chain } = runeAmount.asset;
    const isETH = chain === Chain.Ethereum;
    if (!recipient) throw new Error('rune wallet not found');

    const thorchainAddress = this.getAddress(Chain.THORChain);
    const { address, router, gas_rate } = await this._getInboundDataByChain(chain);
    if ((isETH && !router) || !thorchainAddress) throw new Error(`router not found for ${chain}`);

    return this.deposit({
      router: isETH ? router : undefined,
      assetAmount: runeAmount,
      recipient: address,
      memo: getMemoFor(MemoType.UPGRADE, { address: thorchainAddress }),
      feeRate: (parseInt(gas_rate) || 0) * gasFeeMultiplier[FeeOption.Fast],
    });
  };

  /**
   * Private methods (internal use only ¯\_(ツ)_/¯)
   */
  private _getInboundDataByChain = async (chain: Chain) => {
    if (chain === Chain.THORChain) {
      return {
        gas_rate: '0',
        router: '0',
        address: '',
        halted: false,
        chain: Chain.THORChain,
        pub_key: '',
      };
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

  private _approve = async (
    {
      asset,
      contractAddress,
      amount,
    }: { asset: AssetEntity; contractAddress?: string; amount?: AmountWithBaseDenom },
    type: 'checkOnly' | 'approve' = 'checkOnly',
  ) => {
    const isNativeEVM =
      (asset.chain === Chain.Ethereum && asset.symbol === Chain.Ethereum) ||
      (asset.chain === Chain.Avalanche && asset.symbol === Chain.Avalanche);
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche].includes(asset.chain);
    if (isNativeEVM || !isEVMChain || asset.isSynth) return true;

    const walletMethods = this.connectedWallets[asset.L1Chain as Chain.Avalanche | Chain.Ethereum];
    const walletAction = type === 'checkOnly' ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) {
      throw new Error(`Wallet not connected for ${asset.L1Chain}`);
    }

    const { getTokenAddress } = await import('@thorswap-lib/toolbox-evm');
    const assetAddress = getTokenAddress(asset, asset.L1Chain as EVMChain);
    // TODO: I dont think we need this @towan
    const from = this.getAddress(asset.L1Chain as SupportedChain);
    // if no amount is set use minimum amount for isApproved check

    if (!assetAddress || !from) throw new Error('Asset address && from address not found');

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
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[FeeOption.Fast];

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
    assetAmount: { asset, amount },
    ...restTxParams
  }: CoreTxParams & { router?: string }) => {
    const amountWithBaseDenom = baseAmount(amount.baseAmount.toString(10), asset.decimal);

    return {
      ...restTxParams,
      from: this.getAddress(asset.L1Chain as SupportedChain),
      amount: amountWithBaseDenom,
      asset: createAssetObjFromAsset(asset),
    };
  };
}
