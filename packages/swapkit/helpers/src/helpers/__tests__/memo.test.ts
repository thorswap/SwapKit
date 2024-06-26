import { describe, expect, test } from "bun:test";
import { Chain, MemoType } from "../../types";

import {
  getMemoForDeposit,
  getMemoForLeaveAndBond,
  getMemoForNameRegister,
  getMemoForSaverDeposit,
  getMemoForSaverWithdraw,
  getMemoForWithdraw,
} from "../memo.ts";

describe("getMemoForSaverDeposit", () => {
  test("returns correct memo for single side", () => {
    const result = getMemoForSaverDeposit({ chain: Chain.Ethereum, symbol: "ETH" });
    expect(result).toBe("+:ETH/ETH");
  });
});

describe("getMemoForSaverWithdraw", () => {
  test("returns correct memo for single side", () => {
    const result = getMemoForSaverWithdraw({
      basisPoints: 5000,
      chain: Chain.Ethereum,
      symbol: "ETH",
    });
    expect(result).toBe("-:ETH/ETH:5000");
  });
});

describe("getMemoForLeaveAndBond", () => {
  test("returns correct memo for Leave", () => {
    const result = getMemoForLeaveAndBond({ address: "ABC123", type: MemoType.LEAVE });
    expect(result).toBe("LEAVE:ABC123");
  });

  test("returns correct memo for Bond", () => {
    const result = getMemoForLeaveAndBond({ address: "ABC123", type: MemoType.BOND });
    expect(result).toBe("BOND:ABC123");
  });
});

describe("getMemoForNameRegister", () => {
  test("returns correct memo for single side", () => {
    const result = getMemoForNameRegister({
      name: "asdfg",
      chain: Chain.Ethereum,
      owner: "thor1234",
      address: "0xaasd123",
    });
    expect(result).toBe("~:asdfg:ETH:0xaasd123:thor1234");
  });
});

describe("getMemoForDeposit", () => {
  test("returns correct memo for single side", () => {
    const result = getMemoForDeposit({ chain: Chain.Ethereum, symbol: "ETH" });
    expect(result).toBe("+:ETH.ETH");
  });
});

describe("getMemoForWithdraw", () => {
  test("returns correct memo for single side", () => {
    const result = getMemoForWithdraw({
      chain: Chain.Ethereum,
      symbol: "ETH",
      ticker: "ETH",
      basisPoints: 100,
    });
    expect(result).toBe("-:ETH.ETH:100");
  });
});
