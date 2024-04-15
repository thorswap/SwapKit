import { SwapKitApi } from "@swapkit/api";
import { AssetValue, Chain, type ChainId, type DerivationPath } from "@swapkit/helpers";

import { Bip39, EnglishMnemonic, Slip10, Slip10Curve, stringToPath } from "@cosmjs/crypto";
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import type { CosmosClient } from "../cosmosClient.ts";
import type { BaseCosmosToolboxType } from "../thorchainUtils/types/client-types.ts";
import { USK_KUJIRA_FACTORY_DENOM } from "../util.ts";

type Params = {
  client: CosmosClient;
  decimal: number;
  derivationPath: DerivationPath;
};

export const getFeeRateFromThorswap = async (chainId: ChainId, safeDefault: number) => {
  try {
    const response = await SwapKitApi.getGasRates();

    return response.find((gas) => gas.chainId === chainId)?.gas || safeDefault;
  } catch (e) {
    console.error(e);
    return safeDefault;
  }
};

// TODO: figure out some better way to initialize from base value
export const getAssetFromDenom = (denom: string, amount: string) => {
  switch (denom) {
    case "rune":
      return AssetValue.fromChainOrSignature(Chain.THORChain, Number.parseInt(amount) / 1e8);
    case "bnb":
      return AssetValue.fromChainOrSignature(Chain.Binance, Number.parseInt(amount) / 1e8);
    case "uatom":
    case "atom":
      return AssetValue.fromChainOrSignature(Chain.Cosmos, Number.parseInt(amount) / 1e6);
    case "cacao":
      return AssetValue.fromChainOrSignature(Chain.Maya, Number.parseInt(amount) / 1e10);
    case "maya":
      return AssetValue.fromChainOrSignature(
        `${Chain.Maya}.${Chain.Maya}`,
        Number.parseInt(amount) / 1e4,
      );
    case "ukuji":
    case "kuji":
      return AssetValue.fromChainOrSignature(Chain.Kujira, Number.parseInt(amount) / 1e6);
    case USK_KUJIRA_FACTORY_DENOM:
      // USK on Kujira
      return AssetValue.fromChainOrSignature(`${Chain.Kujira}.USK`, Number.parseInt(amount) / 1e6);

    default:
      return AssetValue.fromString(denom, Number.parseInt(amount) / 1e8);
  }
};

export const BaseCosmosToolbox = ({
  derivationPath,
  client: cosmosClient,
}: Params): BaseCosmosToolboxType => ({
  transfer: cosmosClient.transfer,
  getSigner: (phrase: string) => {
    return DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      prefix: cosmosClient.prefix,
      hdPaths: [stringToPath(`${derivationPath}/0`)],
    });
  },
  getSignerFromPrivateKey: (privateKey: Uint8Array) => {
    return DirectSecp256k1Wallet.fromKey(privateKey, cosmosClient.prefix);
  },
  createPrivateKeyFromPhrase: async (phrase: string) => {
    const derivationPathString = stringToPath(`${derivationPath}/0`);
    const mnemonicChecked = new EnglishMnemonic(phrase);
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked);

    const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, derivationPathString);

    return privkey;
  },
  getAccount: cosmosClient.getAccount,
  validateAddress: (address: string) => cosmosClient.checkAddress(address),
  getAddressFromMnemonic: (phrase: string) =>
    cosmosClient.getAddressFromMnemonic(phrase, `${derivationPath}/0`),
  getPubKeyFromMnemonic: (phrase: string) =>
    cosmosClient.getPubKeyFromMnemonic(phrase, `${derivationPath}/0`),
  getFeeRateFromThorswap,
  getBalance: async (address: string, _potentialScamFilter?: boolean) => {
    const denomBalances = await cosmosClient.getBalance(address);
    return await Promise.all(
      denomBalances
        .filter(({ denom }) => denom && !denom.includes("IBC/"))
        .map(({ denom, amount }) => getAssetFromDenom(denom, amount)),
    );
  },
});

export type BaseCosmosWallet = ReturnType<typeof BaseCosmosToolbox>;
export type CosmosWallets = {
  [chain in Chain.Cosmos | Chain.Kujira | Chain.Binance]: BaseCosmosWallet;
};
