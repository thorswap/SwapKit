import { describe, expect, test } from "bun:test";
import { Chain, MemoType } from "@swapkit/helpers";

import { getMemoFor } from "../memo.ts";

describe("getMemoFor", () => {
  describe("for Leave, Upgrade, and Bond", () => {
    const nodeMemos = [
      [MemoType.LEAVE, "LEAVE:ABC123"],
      [MemoType.BOND, "BOND:ABC123"],
    ];

    for (const [memoType, expected = ""] of nodeMemos) {
      test(`returns correct memo for ${memoType}`, () => {
        const result = getMemoFor(memoType as MemoType, { address: "ABC123" });
        expect(result).toBe(expected);
      });
    }
  });

  describe("for Unbond and Thorname/Mayaname Register", () => {
    test("returns correct memo for Unbond", () => {
      const result = getMemoFor(MemoType.UNBOND, { address: "ABC123", unbondAmount: 1000000000 });
      expect(result).toBe("UNBOND:ABC123:1000000000");
    });

    test("returns correct memo for Thorname Register", () => {
      const result = getMemoFor(MemoType.THORNAME_REGISTER, {
        name: "thorname",
        chain: "BNB",
        address: "0xABC123",
        owner: "0xDEF456",
      });
      expect(result).toBe("~:thorname:BNB:0xABC123:0xDEF456");
    });

    test("returns correct memo for Mayaname Register", () => {
      const result = getMemoFor(MemoType.THORNAME_REGISTER, {
        name: "mayaname",
        chain: "BNB",
        address: "0xABC123",
        owner: "0xDEF456",
      });
      expect(result).toBe("~:mayaname:BNB:0xABC123:0xDEF456");
    });
  });

  describe("for Deposit", () => {
    test("returns correct memo for Deposit (single side)", () => {
      const result = getMemoFor(MemoType.DEPOSIT, {
        chain: Chain.Ethereum,
        symbol: "ETH",
        singleSide: true,
      });
      expect(result).toBe("+:ETH/ETH");
    });

    test("returns correct memo for Deposit (dual side)", () => {
      const result = getMemoFor(MemoType.DEPOSIT, {
        chain: Chain.Avalanche,
        symbol: "AVAX",
        address: "0xABC123",
      });
      expect(result).toBe("+:AVAX.AVAX:0xABC123");
    });
  });

  describe("for Withdraw", () => {
    test("returns correct memo for Withdraw (single side)", () => {
      const result = getMemoFor(MemoType.WITHDRAW, {
        chain: Chain.Bitcoin,
        ticker: "BTC",
        symbol: "BTC",
        basisPoints: 10000,
        singleSide: true,
      });
      expect(result).toBe("-:BTC/BTC:10000");
    });

    test("returns correct memo for Withdraw (dual side)", () => {
      const result = getMemoFor(MemoType.WITHDRAW, {
        chain: Chain.Ethereum,
        ticker: "ETH",
        symbol: "ETH",
        basisPoints: 100,
        targetAssetString: "ETH.ETH",
      });
      expect(result).toBe("-:ETH.ETH:100:ETH.ETH");
    });
  });
});
