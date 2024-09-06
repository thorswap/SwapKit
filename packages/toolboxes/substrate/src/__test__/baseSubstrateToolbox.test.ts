import { describe, expect, test } from "bun:test";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { AssetValue, Chain, SwapKitError, SwapKitNumber } from "@swapkit/helpers";
import {
  type BaseSubstrateToolbox,
  type SubstrateTransferParams,
  substrateValidateAddress,
} from "../toolbox/baseSubstrateToolbox";
import { getToolboxByChain } from "../toolbox/toolboxFactory";

describe("BaseSubstrateToolbox", async () => {
  await cryptoWaitReady();

  const polkadotAddress = "1mfnyhXX3KabfcgKS5okUjkdm5NbFSe5hdBKxDhxgZtg9Gw";
  const substrateGenericAddress = "5CqNeeSTfG47A8cAMo2ocKubn95itwtW1CthAfEMQbYNVnLZ";
  const chainflipAddress = "cFJe9czbqbr8tWJ2twRnS8yTqy2ss45zWkRjCDYWNHZ24fxqy";
  const encodedAddress = [
    34, 17, 98, 190, 86, 52, 82, 85, 95, 105, 25, 139, 222, 230, 73, 0, 81, 175, 41, 221, 150, 81,
    207, 37, 67, 117, 26, 83, 36, 205, 150, 18,
  ];

  const keyring = new Keyring({ type: "sr25519" });
  const signer = keyring.addFromUri("//Alice", { name: "Alice default" });
  const gasAsset: AssetValue = AssetValue.from({ chain: Chain.Polkadot, value: "100" });

  const toolbox: ReturnType<typeof BaseSubstrateToolbox> = await getToolboxByChain(Chain.Polkadot, {
    signer,
  });

  test("decodeAddress should decode a valid address", () => {
    const address = polkadotAddress;
    const decoded = toolbox.decodeAddress(address);
    expect(decoded.length).toBe(32);
  });

  test("encodeAddress should encode a valid address", () => {
    const address = new Uint8Array(encodedAddress);
    const encoded = toolbox.encodeAddress(address);
    expect(encoded).toBe(substrateGenericAddress);
  });

  test("createKeyring should create a keyring from a phrase", async () => {
    const phrase = "test phrase";
    const keyring = await toolbox.createKeyring(phrase);
    expect(keyring).toBeDefined();
  });

  test("getAddress should return the address of the signer", () => {
    const address = toolbox.getAddress();
    expect(address).toBe(signer.address);
  });

  test("createTransfer should create a transfer transaction", () => {
    const params: SubstrateTransferParams = {
      recipient: signer.address,
      assetValue: gasAsset,
    };
    const transfer = toolbox.createTransfer(params);
    expect(transfer).toBeDefined();
  });

  test("getBalance should return the balance of an address", async () => {
    const balance = await toolbox.getBalance(signer.address);
    expect(balance?.[0]?.getValue("string")).toBe("0");
  });

  test("validateAddress should return true for a valid address", () => {
    const isValid = toolbox.validateAddress(polkadotAddress);
    expect(isValid).toBe(true);
  });

  // this test case will work if the signer can cover gas fee.
  // test("transfer should execute a transfer", async () => {
  //   const params: SubstrateTransferParams = {
  //     recipient: signer.address,
  //     assetValue: gasAsset,
  //   };
  //   const txHash = await toolbox.transfer(params);
  //   expect(txHash).toBeDefined();
  // });

  test("estimateTransactionFee should return the estimated fee", async () => {
    const params: SubstrateTransferParams = {
      recipient: signer.address,
      assetValue: gasAsset,
    };
    const fee = await toolbox.estimateTransactionFee(params);
    expect(fee?.gt(new SwapKitNumber(0))).toBe(true);
  });

  test("sign should sign a transaction", async () => {
    const tx = toolbox.createTransfer({
      recipient: signer.address,
      assetValue: gasAsset,
    });

    if (!tx) {
      throw new SwapKitError("core_transaction_failed");
    }

    const signedTx = await toolbox.sign(tx);
    expect(signedTx).toBeDefined();
  });

  test("signAndBroadcast should sign and broadcast a transaction", async () => {
    const tx = toolbox.createTransfer({
      recipient: signer.address,
      assetValue: gasAsset,
    });

    if (!tx) {
      throw new SwapKitError("core_transaction_failed");
    }

    const hash = await toolbox.signAndBroadcast(tx);
    expect(hash).toBeDefined();
  });

  test("substrateValidateAddress should validate addresses for different chains", () => {
    const isPolkadotAddressValid = substrateValidateAddress({
      address: substrateGenericAddress,
      chain: Chain.Polkadot,
    });
    expect(isPolkadotAddressValid).toBe(true);
    const isChainFlipAddressValid = substrateValidateAddress({
      address: chainflipAddress,
      chain: Chain.Chainflip,
    });
    expect(isChainFlipAddressValid).toBe(true);
  });
});
