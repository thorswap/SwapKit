// @ts-nocheck - Test file with intentional mocking of browser globals
import { beforeEach, describe, expect, test } from "bun:test";
import { AssetValue, Chain, WalletOption } from "@swapkit/helpers";

import { noirWallet } from "../index";

const TRANSPARENT_ADDRESS = "t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F";

function mockNoirWallet({ balance = {}, requests = [] } = {}) {
  globalThis.window = {
    noirwallet: {
      isNoirWallet: true,
      version: "1.0.25",
      zcash: {
        disconnect: async () => undefined,
        on: () => undefined,
        removeListener: () => undefined,
        request: ({ method, params }) => {
          requests.push({ method, params });

          switch (method) {
            case "zcash_requestAccounts":
              return Promise.resolve({ accounts: [], shielded: "zs1mock", transparent: TRANSPARENT_ADDRESS });
            case "zcash_getBalance":
              return Promise.resolve({
                available: "1.42",
                shielded: "1.5",
                spendable: "1.45",
                total: "1.6",
                transparent: "0.1",
                ...balance,
              });
            case "zcash_sendTransaction":
              return Promise.resolve("mocktxid123");
            case "zcash_signMessage":
              return Promise.resolve({
                address: TRANSPARENT_ADDRESS,
                pubkey: "02aa",
                signature: "sigabc",
                signingMode: "current",
              });
            default:
              return Promise.reject(new Error(`unexpected method ${method}`));
          }
        },
      },
    },
  };

  return requests;
}

async function connectAndGetWallet() {
  let addedWallet = null;
  const connect = noirWallet.connectNoirWallet.connectWallet({
    addChain: (wallet) => {
      addedWallet = wallet;
    },
  });

  await connect([Chain.Zcash]);

  return addedWallet;
}

describe("noirWallet", () => {
  let requests = [];

  beforeEach(() => {
    requests = mockNoirWallet();
  });

  test("exposes Zcash as the only supported chain", () => {
    expect(noirWallet.connectNoirWallet.supportedChains).toEqual([Chain.Zcash]);
  });

  test("connects via zcash_requestAccounts and registers the transparent address", async () => {
    const wallet = await connectAndGetWallet();

    expect(requests.some(({ method }) => method === "zcash_requestAccounts")).toBe(true);
    expect(wallet.address).toBe(TRANSPARENT_ADDRESS);
    expect(wallet.chain).toBe(Chain.Zcash);
    expect(wallet.walletType).toBe(WalletOption.NOIR_WALLET);
  });

  test("getBalance reads the wallet's spendable (shielded pool) balance", async () => {
    const wallet = await connectAndGetWallet();
    const [balance] = await wallet.getBalance();

    expect(balance.chain).toBe(Chain.Zcash);
    expect(balance.getValue("string")).toBe("1.42");
  });

  test("transfer delegates to zcash_sendTransaction without memo/type fields", async () => {
    const wallet = await connectAndGetWallet();
    const assetValue = AssetValue.from({ chain: Chain.Zcash, value: "0.5" });

    const txid = await wallet.transfer({ assetValue, recipient: "t1RecipientAddr" });

    expect(txid).toBe("mocktxid123");
    const sendCall = requests.find(({ method }) => method === "zcash_sendTransaction");
    expect(sendCall.params).toEqual([{ amount: "0.5", to: "t1RecipientAddr" }]);
  });

  test("transfer with memo throws (OP_RETURN routes unsupported)", async () => {
    const wallet = await connectAndGetWallet();
    const assetValue = AssetValue.from({ chain: Chain.Zcash, value: "0.5" });

    expect(() => wallet.transfer({ assetValue, memo: "=:BTC.BTC:bc1q...", recipient: "t1RecipientAddr" })).toThrow(
      "wallet_noir_wallet_memo_not_supported",
    );
  });

  test("signMessage returns the signature string", async () => {
    const wallet = await connectAndGetWallet();

    expect(await wallet.signMessage("hello swapkit")).toBe("sigabc");
  });

  test("throws when the extension is not installed", () => {
    globalThis.window = {};

    const connect = noirWallet.connectNoirWallet.connectWallet({ addChain: () => undefined });

    expect(connect([Chain.Zcash])).rejects.toThrow("wallet_noir_wallet_not_found");
  });
});
