import { mnemonicToSeedSync } from "@scure/bip39";
import {
  AccountLayout,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  AssetValue,
  Chain,
  DerivationPath,
  RPCUrl,
  SwapKitError,
  SwapKitNumber,
  type WalletTxParams,
} from "@swapkit/helpers";
import { HDKey } from "micro-key-producer/slip10.js";

function validateAddress(address: string) {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBuffer());
  } catch (_) {
    return false;
  }
}

function createKeysForPath({
  phrase,
  derivationPath = DerivationPath.SOL,
}: { phrase: string; derivationPath?: string }) {
  const seed = mnemonicToSeedSync(phrase);
  const hdKey = HDKey.fromMasterSeed(seed);

  return Keypair.fromSeed(hdKey.derive(derivationPath, true).privateKey);
}

function getAddressFromKeys(keypair: Keypair) {
  return keypair.publicKey.toString();
}

async function getTokenBalances({
  connection,
  address,
}: { connection: Connection; address: string }) {
  const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(address), {
    programId: TOKEN_PROGRAM_ID,
  });

  const tokenBalances: AssetValue[] = [];

  for await (const ta of tokenAccounts.value) {
    const accData = AccountLayout.decode(ta.account.data);
    const { decimals: decimal, address } = await getMint(connection, accData.mint);

    if (accData.amount > BigInt(0)) {
      tokenBalances.push(
        new AssetValue({
          value: SwapKitNumber.fromBigInt(accData.amount, decimal),
          decimal,
          identifier: `${Chain.Solana}.TOKEN-${address.toString()}`,
        }),
      );
    }
  }

  return tokenBalances;
}

function getBalance(connection: Connection) {
  return async (address: string) => {
    const SOLBalance = await connection.getBalance(new PublicKey(address));
    const tokenBalances = await getTokenBalances({ connection, address });

    return [AssetValue.fromChainOrSignature(Chain.Solana, BigInt(SOLBalance)), ...tokenBalances];
  };
}

async function createSolanaTokenTransaction({
  tokenAddress,
  recipient,
  from,
  connection,
  amount,
  decimals,
}: {
  tokenAddress: string;
  recipient: string;
  from: PublicKey;
  connection: Connection;
  amount: number;
  decimals: number;
}) {
  const transaction = new Transaction();
  const tokenPublicKey = new PublicKey(tokenAddress);
  const fromSPLAddress = await getAssociatedTokenAddress(tokenPublicKey, from);

  const recipientPublicKey = new PublicKey(recipient);
  const recipientSPLAddress = await getAssociatedTokenAddress(tokenPublicKey, recipientPublicKey);

  try {
    await getAccount(connection, recipientSPLAddress);
    return transaction.add(
      createTransferCheckedInstruction(
        fromSPLAddress,
        tokenPublicKey,
        recipientSPLAddress,
        from,
        amount,
        decimals,
      ),
    );
  } catch (_) {
    return transaction.add(
      createAssociatedTokenAccountInstruction(
        from,
        recipientSPLAddress,
        recipientPublicKey,
        tokenPublicKey,
      ),
    );
  }
}

function transfer(connection: Connection) {
  return async ({
    recipient,
    assetValue,
    fromKeypair,
  }: WalletTxParams & {
    assetValue: AssetValue;
    fromKeypair: Keypair;
  }) => {
    if (!validateAddress(recipient)) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    const transaction = assetValue.isGasAsset
      ? new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            lamports: assetValue.getValue("number"),
            toPubkey: new PublicKey(recipient),
          }),
        )
      : assetValue.address
        ? await createSolanaTokenTransaction({
            amount: assetValue.getValue("number"),
            connection,
            decimals: assetValue.decimal as number,
            from: fromKeypair.publicKey,
            recipient,
            tokenAddress: assetValue.address,
          })
        : undefined;

    if (!transaction) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    const blockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    return sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
  };
}

export const SOLToolbox = ({ rpcUrl = RPCUrl.Solana }: { rpcUrl?: string } = {}) => {
  const connection = new Connection(rpcUrl, "confirmed");

  return {
    createKeysForPath,
    getAddressFromKeys,
    getBalance: getBalance(connection),
    transfer: transfer(connection),
    validateAddress,
  };
};
