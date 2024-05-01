import {
  Chain,
  ChainId,
  type ConnectWalletParams,
  type DerivationPathArray,
  FeeOption,
  RPCUrl,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import type { DepositParam, TransferParams } from "@swapkit/toolbox-cosmos";
import type { UTXOBuildTxParams } from "@swapkit/toolbox-utxo";

import type { BinanceLedger } from "./clients/binance/index.ts";
import type { CosmosLedger } from "./clients/cosmos.ts";
import type {
  ArbitrumLedger,
  AvalancheLedger,
  BinanceSmartChainLedger,
  EthereumLedger,
  OptimismLedger,
  PolygonLedger,
} from "./clients/evm.ts";
import type { THORChainLedger } from "./clients/thorchain/index.ts";
import type {
  BitcoinCashLedger,
  BitcoinLedger,
  DashLedger,
  DogecoinLedger,
  LitecoinLedger,
} from "./clients/utxo.ts";
import type { LEDGER_SUPPORTED_CHAINS } from "./helpers/index.ts";
import { getLedgerAddress, getLedgerClient } from "./helpers/index.ts";

type LedgerConfig = {
  api?: Todo;
  rpcUrl?: string;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
};

// reduce memo length by removing trade limit
const reduceMemo = (memo?: string, affiliateAddress = "t") => {
  if (!memo?.includes("=:")) return memo;

  const removedAffiliate = memo.includes(`:${affiliateAddress}:`)
    ? memo.split(`:${affiliateAddress}:`)[0]
    : memo;

  return removedAffiliate?.substring(0, removedAffiliate.lastIndexOf(":"));
};

const recursivelyOrderKeys = (unordered: Todo) => {
  // If it's an array - recursively order any
  // dictionary items within the array
  if (Array.isArray(unordered)) {
    unordered.forEach((item, index) => {
      unordered[index] = recursivelyOrderKeys(item);
    });
    return unordered;
  }

  // If it's an object - let's order the keys
  if (typeof unordered !== "object") return unordered;
  const ordered: Todo = {};
  const sortedKeys = Object.keys(unordered).sort();

  for (const key of sortedKeys) {
    ordered[key] = recursivelyOrderKeys(unordered[key]);
  }

  return ordered;
};

const stringifyKeysInOrder = (data: Todo) => JSON.stringify(recursivelyOrderKeys(data));

const getToolbox = async ({
  api,
  rpcUrl,
  address,
  chain,
  covalentApiKey,
  ethplorerApiKey,
  blockchairApiKey,
  signer,
  derivationPath,
  stagenet = false,
}: LedgerConfig & {
  address: string;
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  signer:
    | ReturnType<typeof ArbitrumLedger>
    | ReturnType<typeof AvalancheLedger>
    | ReturnType<typeof BinanceSmartChainLedger>
    | ReturnType<typeof BitcoinLedger>
    | ReturnType<typeof BitcoinCashLedger>
    | ReturnType<typeof DashLedger>
    | ReturnType<typeof DogecoinLedger>
    | ReturnType<typeof EthereumLedger>
    | ReturnType<typeof LitecoinLedger>
    | ReturnType<typeof OptimismLedger>
    | ReturnType<typeof PolygonLedger>
    | BinanceLedger
    | THORChainLedger
    | CosmosLedger;
  derivationPath?: DerivationPathArray;
  stagenet?: boolean;
}) => {
  const utxoParams = { apiKey: blockchairApiKey, rpcUrl, apiClient: api };

  switch (chain) {
    case Chain.Bitcoin: {
      const { BTCToolbox } = await import("@swapkit/toolbox-utxo");
      const toolbox = BTCToolbox(utxoParams);

      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = params.feeRate || (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          sender: address,
          feeRate,
          fetchTxHex: true,
        });
        const txHex = await (signer as ReturnType<typeof BitcoinLedger>).signTransaction(
          psbt,
          inputs,
        );

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.BitcoinCash: {
      const { BCHToolbox } = await import("@swapkit/toolbox-utxo");

      const toolbox = BCHToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });

        const txHex = await (signer as ReturnType<typeof BitcoinCashLedger>).signTransaction(
          psbt,
          inputs,
        );

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Dash: {
      const { DASHToolbox } = await import("@swapkit/toolbox-utxo");
      const toolbox = DASHToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as ReturnType<typeof DogecoinLedger>).signTransaction(
          psbt,
          inputs,
        );

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Dogecoin: {
      const { DOGEToolbox } = await import("@swapkit/toolbox-utxo");
      const toolbox = DOGEToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as ReturnType<typeof DogecoinLedger>).signTransaction(
          psbt,
          inputs,
        );

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Litecoin: {
      const { LTCToolbox } = await import("@swapkit/toolbox-utxo");
      const toolbox = LTCToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as ReturnType<typeof LitecoinLedger>).signTransaction(
          psbt,
          inputs,
        );

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Binance: {
      const { BinanceToolbox } = await import("@swapkit/toolbox-cosmos");
      const toolbox = BinanceToolbox({ stagenet: false });
      const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
        const { transaction, signMsg } = await toolbox.createTransactionAndSignMsg({
          from: address,
          recipient,
          assetValue,
          memo,
        });
        const signBytes = transaction.getSignBytes(signMsg);
        const pubKeyResponse = await (signer as BinanceLedger).ledgerApp.getPublicKey(
          derivationPath,
        );
        const signResponse = await (signer as BinanceLedger).ledgerApp.sign(
          signBytes,
          derivationPath,
        );

        const pubKey = await toolbox.getPublicKey(pubKeyResponse?.pk?.toString("hex"));
        const signedTx = transaction.addSignature(pubKey, signResponse?.signature);

        const res = await toolbox.sendRawTransaction(signedTx.serialize(), true);

        return res?.result?.hash;
      };
      return { ...toolbox, transfer };
    }

    case Chain.Cosmos: {
      const { createSigningStargateClient, getDenom, GaiaToolbox } = await import(
        "@swapkit/toolbox-cosmos"
      );
      const toolbox = GaiaToolbox();
      const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
        const from = address;
        if (!assetValue) throw new Error("invalid asset");

        const sendCoinsMessage = {
          amount: [
            {
              amount: assetValue.getBaseValue("string"),
              denom: getDenom(`u${assetValue.symbol}`).toLowerCase(),
            },
          ],
          fromAddress: from,
          toAddress: recipient,
        };

        const msg = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: sendCoinsMessage,
        };

        const signingClient = await createSigningStargateClient(
          RPCUrl.Cosmos,
          signer as CosmosLedger,
          "0.007uatom",
        );

        const tx = await signingClient.signAndBroadcast(address, [msg], 2, memo);

        return tx.transactionHash;
      };

      return { ...toolbox, transfer };
    }

    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error("Ethplorer API key is not defined");
      const { ETHToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return ETHToolbox({
        api,
        signer: signer as ReturnType<typeof EthereumLedger>,
        provider: getProvider(Chain.Ethereum, rpcUrl),
        ethplorerApiKey,
      });
    }
    case Chain.Avalanche: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { AVAXToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return AVAXToolbox({
        api,
        signer: signer as ReturnType<typeof AvalancheLedger>,
        provider: getProvider(Chain.Avalanche, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.BinanceSmartChain: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { BSCToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return BSCToolbox({
        api,
        signer: signer as ReturnType<typeof BinanceSmartChainLedger>,
        provider: getProvider(Chain.BinanceSmartChain, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.Arbitrum: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { ARBToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return ARBToolbox({
        api,
        signer: signer as ReturnType<typeof ArbitrumLedger>,
        provider: getProvider(Chain.Arbitrum, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.Optimism: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { OPToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return OPToolbox({
        api,
        signer: signer as ReturnType<typeof OptimismLedger>,
        provider: getProvider(Chain.Optimism, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.Polygon: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { MATICToolbox, getProvider } = await import("@swapkit/toolbox-evm");

      return MATICToolbox({
        api,
        signer: signer as ReturnType<typeof PolygonLedger>,
        provider: getProvider(Chain.Polygon, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.THORChain: {
      const { SignMode } = await import("cosmjs-types/cosmos/tx/signing/v1beta1/signing.js");
      const { TxRaw } = await import("cosmjs-types/cosmos/tx/v1beta1/tx.js");
      const { encodePubkey, makeAuthInfoBytes } = await import("@cosmjs/proto-signing");
      const {
        createStargateClient,
        buildEncodedTxBody,
        ThorchainToolbox,
        buildAminoMsg,
        getDefaultChainFee,
        fromBase64,
        prepareMessageForBroadcast,
      } = await import("@swapkit/toolbox-cosmos");
      const toolbox = ThorchainToolbox({ stagenet: false });

      const fee = getDefaultChainFee(chain);

      // ANCHOR (@Chillios): Same parts in methods + can extract StargateClient init to toolbox
      const thorchainTransfer = async ({
        memo = "",
        assetValue,
        ...rest
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Refactor to reduce complexity
      }: TransferParams | DepositParam) => {
        const account = await toolbox.getAccount(address);
        if (!account) throw new Error("invalid account");
        if (!assetValue) throw new Error("invalid asset");
        if (!(signer as THORChainLedger).pubkey) throw new Error("Account pubkey not found");
        const rpcUrl = stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain;

        const { accountNumber, sequence = "0" } = account;

        const msgs = recursivelyOrderKeys([
          buildAminoMsg({ chain, from: address, assetValue, memo, ...rest }),
        ]);

        // get tx signing msg
        const rawSendTx = stringifyKeysInOrder({
          account_number: accountNumber?.toString(),
          chain_id: ChainId.THORChain,
          fee,
          memo,
          msgs,
          sequence: sequence?.toString(),
        });

        const signatures = await (signer as THORChainLedger).signTransaction(
          rawSendTx,
          sequence?.toString(),
        );
        if (!signatures) throw new Error("tx signing failed");

        const bodyMsgs = msgs.map(prepareMessageForBroadcast);
        const bodyBytes = await buildEncodedTxBody({ chain, msgs: bodyMsgs, memo });

        const pubkey = encodePubkey({
          type: "tendermint/PubKeySecp256k1",
          value: (signer as THORChainLedger)?.pubkey,
        });

        const authInfoBytes = makeAuthInfoBytes(
          [{ pubkey, sequence: Number(sequence) }],
          fee.amount,
          Number.parseInt(fee.gas),
          undefined,
          undefined,
          SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        );

        const signature = signatures?.[0]?.signature
          ? fromBase64(signatures[0].signature)
          : Uint8Array.from([]);

        const txRaw = TxRaw.fromPartial({ bodyBytes, authInfoBytes, signatures: [signature] });
        const txBytes = TxRaw.encode(txRaw).finish();

        const broadcaster = await createStargateClient(rpcUrl);
        const { transactionHash } = await broadcaster.broadcastTx(txBytes);

        return transactionHash;
      };

      const transfer = (params: TransferParams) => thorchainTransfer(params);
      const deposit = (params: DepositParam) => thorchainTransfer(params);

      return { ...toolbox, deposit, transfer, signMessage: (signer as THORChainLedger).sign };
    }

    default:
      throw new Error("Unsupported chain");
  }
};

function connectLedger({
  addChain,
  apis,
  rpcUrls,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey, blockchairApiKey, stagenet },
}: ConnectWalletParams) {
  return async function connectLedger(
    chains: (typeof LEDGER_SUPPORTED_CHAINS)[number][],
    derivationPath?: DerivationPathArray,
  ) {
    const chain = chains[0];
    if (!chain) return false;

    setRequestClientConfig({ apiKey: thorswapApiKey });

    const ledgerClient = await getLedgerClient({ chain, derivationPath });
    if (!ledgerClient) return false;

    const address = await getLedgerAddress({ chain, ledgerClient });
    const toolbox = await getToolbox({
      address,
      api: apis[chain as Chain.Avalanche],
      chain,
      covalentApiKey,
      derivationPath,
      ethplorerApiKey,
      rpcUrl: rpcUrls[chain],
      signer: ledgerClient,
      blockchairApiKey,
      stagenet,
    });

    addChain({
      ...toolbox,
      chain,
      address,
      balance: [],
      walletType: WalletOption.LEDGER,
    });

    return true;
  };
}

export const ledgerWallet = { connectLedger } as const;
