import { AssetValue } from "@swapkit/helpers";
import { parseMemo } from "../thorchainUtils/memo";

import { describe, expect, it } from "bun:test";

describe("parseMemo", () => {
  it("throws an error when memo action is not found", () => {
    expect(() => parseMemo("")).toThrowError("No memo action found");
  });

  it("throws an error for unknown memo actions", () => {
    expect(() => parseMemo("UNKNOWN:123")).toThrowError("Unknown memo action");
  });

  describe("BOND action", () => {
    it("parses BOND memo correctly", () => {
      const memo = "BOND:0x123";
      const result = parseMemo(memo);
      expect(result).toEqual({
        address: "0x123",
      });
    });
  });

  describe("UNBOND action", () => {
    it("parses UNBOND memo correctly", () => {
      const memo = "UNBOND:0x123:100000";
      const result = parseMemo(memo);
      expect(result).toEqual({
        address: "0x123",
        unbondAmount: SwapKitNumber.fromBigInt(BigInt("100000"), BaseDecimal.THOR),
      });
    });
  });

  describe("LEAVE action", () => {
    it("parses LEAVE memo correctly", () => {
      const memo = "LEAVE:0x123";
      const result = parseMemo(memo);
      expect(result).toEqual({
        address: "0x123",
      });
    });
  });

  describe("OPEN_LOAN action", () => {
    it("parses OPEN_LOAN memo correctly", () => {
      const memo = "OPEN_LOAN:0x123:ETH:500";
      const result = parseMemo(memo);
      expect(result).toEqual({
        address: "0x123",
        asset: AssetValue.fromStringSync("ETH"),
      });
    });
  });

  describe("CLOSE_LOAN action", () => {
    it("parses CLOSE_LOAN memo correctly", () => {
      const memo = "CLOSE_LOAN:0x123:ETH:50";
      const result = parseMemo(memo);
      expect(result).toEqual({
        address: "0x123",
        asset: AssetValue.fromStringSync("ETH"),
      });
    });
  });

  describe("SWAP action", () => {
    it("parses SWAP memo correctly", () => {
      const memo = "SWAP:ETH:0x123:100/10/2:0xabc:0.01:0xdef:USDT";
      const result = parseMemo(memo);
      expect(result).toEqual({
        toAsset: AssetValue.fromStringSync("ETH"),
        toAddress: "0x123",
        limit: SwapKitNumber.fromBigInt(BigInt("100"), BaseDecimal.THOR),
        ssInterval: 10,
        ssQuantity: 2,
        affiliate: "0xabc",
        fee: "0.01",
        aggregatorContract: "0xdef",
        aggregatorToken: AssetValue.fromStringSync("USDT"),
        aggregatorLimit: { limit: undefined, blockInterval: undefined, parts: undefined },
      });
    });
  });
});
