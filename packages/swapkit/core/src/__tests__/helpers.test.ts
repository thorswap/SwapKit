import { Chain, ChainToExplorerUrl, CosmosChains, EVMChains, UTXOChains } from "@swapkit/types";
import { describe, expect, test } from "vitest";
import { getExplorerAddressUrl, getExplorerTxUrl } from "../helpers/explorerUrls.ts";

describe("Explorer URLs", () => {
  for (const chain of CosmosChains.filter((c) => c !== Chain.Cosmos)) {
    test(`getExplorerTxUrl returns correct URL for ${chain}`, () => {
      expect(getExplorerTxUrl({ chain, txHash: "0x123456789" })).toBe(
        `${ChainToExplorerUrl[chain]}/tx/123456789`,
      );

      expect(getExplorerAddressUrl({ chain, address: "asdfg" })).toBe(
        `${ChainToExplorerUrl[chain]}/address/asdfg`,
      );
    });
  }

  for (const chain of EVMChains) {
    test(`getExplorerTxUrl returns correct URL for ${chain}`, () => {
      expect(getExplorerTxUrl({ chain, txHash: "0x123456789" })).toBe(
        `${ChainToExplorerUrl[chain]}/tx/0x123456789`,
      );

      expect(getExplorerAddressUrl({ chain, address: "asdfg" })).toBe(
        `${ChainToExplorerUrl[chain]}/address/asdfg`,
      );
    });
  }

  for (const chain of UTXOChains.filter((c) => c !== Chain.Dash)) {
    test(`getExplorerTxUrl returns correct URL for ${chain}`, () => {
      expect(getExplorerTxUrl({ chain, txHash: "0x123456789" })).toBe(
        `${ChainToExplorerUrl[chain]}/transaction/0x123456789`,
      );

      expect(getExplorerAddressUrl({ chain, address: "asdfg" })).toBe(
        `${ChainToExplorerUrl[chain]}/address/asdfg`,
      );
    });
  }

  test(`getExplorerTxUrl returns correct URL for ${Chain.Cosmos}`, () => {
    expect(getExplorerTxUrl({ chain: Chain.Cosmos, txHash: "0x123456789" })).toBe(
      `${ChainToExplorerUrl[Chain.Cosmos]}/transactions/0x123456789`,
    );

    expect(getExplorerAddressUrl({ chain: Chain.Cosmos, address: "asdfg" })).toBe(
      `${ChainToExplorerUrl[Chain.Cosmos]}/account/asdfg`,
    );
  });

  test("getExplorerTxUrl throws Error for unsupported Chain", () => {
    expect(() =>
      getExplorerTxUrl({ chain: "unsupported" as Chain, txHash: "0x12345" }),
    ).toThrowError("Unsupported chain: unsupported");
  });

  test("getExplorerAddressUrl throws Error for unsupported Chain", () => {
    expect(() =>
      getExplorerAddressUrl({ chain: "unsupported" as Chain, address: "asdfg" }),
    ).toThrowError("Unsupported chain: unsupported");
  });
  test("getExplorerTxUrl adds 0x for EVM like chains", () => {
    expect(getExplorerTxUrl({ chain: Chain.Ethereum, txHash: "12345" })).toBe(
      "https://etherscan.io/tx/0x12345",
    );
  });

  test("getExplorerTxUrl returns correct URL for Cosmos", () => {
    expect(getExplorerTxUrl({ chain: Chain.Cosmos, txHash: "pqrst" })).toBe(
      "https://cosmos.bigdipper.live/transactions/pqrst",
    );
  });
  test("getExplorerAddressUrl returns correct URL for Cosmos", () => {
    expect(getExplorerAddressUrl({ chain: Chain.Cosmos, address: "zabcd" })).toBe(
      "https://cosmos.bigdipper.live/account/zabcd",
    );
  });
});
