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

import type { LEDGER_SUPPORTED_CHAINS } from "./helpers/index.ts";
import { getLedgerAddress, getLedgerClient } from "./helpers/index.ts";

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
  blockchairApiKey,
  chain,
  covalentApiKey,
  derivationPath,
  ethplorerApiKey,
  rpcUrl,
  stagenet,
}: ConnectWalletParams["config"] & {
  api: ConnectWalletParams["apis"][(typeof LEDGER_SUPPORTED_CHAINS)[number]];
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  derivationPath?: DerivationPathArray;
  rpcUrl?: string;
  stagenet?: boolean;
}) => {
  switch (chain) {
    case Chain.BitcoinCash:
    case Chain.Bitcoin:
    case Chain.Dash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-utxo");
      const toolbox = getToolboxByChain(chain)({
        apiClient: api,
        apiKey: blockchairApiKey,
        rpcUrl,
      });
      const signer = await getLedgerClient({ chain, derivationPath });
      const address = await getLedgerAddress({ chain, ledgerClient: signer });

      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = params.feeRate || (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          sender: address,
          feeRate,
          memo: [Chain.Bitcoin].includes(chain) ? params.memo : reduceMemo(params.memo),
          fetchTxHex: true,
        });
        const txHex = await signer.signTransaction(psbt, inputs);

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, address, transfer };
    }

    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error("Ethplorer API key is not defined");
      const { getToolboxByChain, getProvider } = await import("@swapkit/toolbox-evm");
      const signer = await getLedgerClient({ chain, derivationPath });
      const address = await getLedgerAddress({ chain, ledgerClient: signer });
      const provider = getProvider(chain, rpcUrl);
      const toolbox = getToolboxByChain(chain);

      return { ...toolbox({ api, signer, provider, ethplorerApiKey }), address };
    }
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.BinanceSmartChain: {
      if (!covalentApiKey) throw new Error("Covalent API key is not defined");
      const { getToolboxByChain, getProvider } = await import("@swapkit/toolbox-evm");
      const signer = await getLedgerClient({ chain, derivationPath });
      const address = await getLedgerAddress({ chain, ledgerClient: signer });
      const toolbox = getToolboxByChain(chain);
      const provider = getProvider(chain, rpcUrl);

      return { ...toolbox({ api, signer, provider, covalentApiKey }), address };
    }

    case Chain.Cosmos: {
      const { createSigningStargateClient, getDenom, GaiaToolbox } = await import(
        "@swapkit/toolbox-cosmos"
      );
      const toolbox = GaiaToolbox();
      const signer = await getLedgerClient({ chain, derivationPath });
      const address = await getLedgerAddress({ chain, ledgerClient: signer });

      const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
        if (!assetValue) throw new Error("invalid asset");

        const sendCoinsMessage = {
          amount: [
            {
              amount: assetValue.getBaseValue("string"),
              denom: getDenom(`u${assetValue.symbol}`).toLowerCase(),
            },
          ],
          fromAddress: address,
          toAddress: recipient,
        };

        const signingClient = await createSigningStargateClient(
          RPCUrl.Cosmos,
          signer,
          "0.007uatom",
        );

        const { transactionHash } = await signingClient.signAndBroadcast(
          address,
          [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: sendCoinsMessage }],
          2,
          memo,
        );

        return transactionHash;
      };

      return { ...toolbox, address, transfer };
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
      const signer = await getLedgerClient({ chain, derivationPath });
      const address = await getLedgerAddress({ chain, ledgerClient: signer });

      const fee = getDefaultChainFee(chain);
      const { pubkey: value, signTransaction, sign: signMessage } = signer;

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

        if (!value) throw new Error("Account pubkey not found");
        const rpcUrl = stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain;

        const { accountNumber, sequence: sequenceNumber } = account;
        const sequence = (sequenceNumber || 0).toString();

        const orderedMessages = recursivelyOrderKeys([
          buildAminoMsg({ chain, from: address, assetValue, memo, ...rest }),
        ]);

        // get tx signing msg
        const rawSendTx = stringifyKeysInOrder({
          account_number: accountNumber?.toString(),
          chain_id: ChainId.THORChain,
          fee,
          memo,
          orderedMessages,
          sequence,
        });

        const signatures = await signTransaction(rawSendTx, sequence);
        if (!signatures) throw new Error("tx signing failed");

        const pubkey = encodePubkey({ type: "tendermint/PubKeySecp256k1", value });
        const msgs = orderedMessages.map(prepareMessageForBroadcast);
        const bodyBytes = buildEncodedTxBody({ msgs, chain, memo });

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

      return { ...toolbox, address, deposit, transfer, signMessage };
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
    const [chain] = chains;
    if (!chain) return false;

    setRequestClientConfig({ apiKey: thorswapApiKey });

    const toolbox = await getToolbox({
      api: apis[chain],
      blockchairApiKey,
      chain,
      derivationPath,
      covalentApiKey,
      ethplorerApiKey,
      rpcUrl: rpcUrls[chain],
      stagenet,
    });

    addChain({ ...toolbox, chain, balance: [], walletType: WalletOption.LEDGER });

    return true;
  };
}

export const ledgerWallet = { connectLedger } as const;
