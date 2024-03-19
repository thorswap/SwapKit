import { Chain } from "@swapkit/types";
import { describe, expect, test } from "vitest";

import { findAssetBy } from "../asset.ts";
import { derivationPathToString, getTHORNameCost, validateTHORName } from "../others.ts";

describe("derivationPathToString", () => {
  test("should return the correct string for a full path", () => {
    const path = [1, 2, 3, 4, 5];
    expect(derivationPathToString(path)).toEqual("1'/2'/3'/4/5");
  });

  test("should return the correct string for a short path", () => {
    const path = [1, 2, 3, 4];
    expect(derivationPathToString(path)).toEqual("1'/2'/3'/4");
  });
});

describe("getTHORNameCost", () => {
  describe("for correct values", () => {
    const costCases = [
      [1, 11],
      [2, 12],
      [3, 13],
      [10, 20],
    ];

    for (const [years, expected] of costCases) {
      test(`returns correct ${expected} cost for ${years} years`, () => {
        const result = getTHORNameCost(years);
        expect(result).toBe(expected);
      });
    }
  });

  test("throws an error for negative years", () => {
    expect(() => getTHORNameCost(-1)).toThrowError("Invalid number of year");
  });
});

describe("validateTHORName", () => {
  const casesWithExpectation: [string, boolean][] = [
    ["validname", true],
    ["valid-name", true],
    ["valid_name", true],
    ["valid+name", true],
    ["name_with_numbers123", true],
    ["UPPER_CASE", true],
    ["toolongname123456789012345678901", false],
    ["invalid@name", false],
    ["invalid!name", false],
    ["invalid#name", false],
  ];

  for (const [name, expected] of casesWithExpectation) {
    test(`returns ${expected} for THORName "${name}"`, () => {
      const result = validateTHORName(name);
      expect(result).toBe(expected);
    });
  }
});

describe("getAssetBy", () => {
  test("find asset by identifier", async () => {
    const assetByIdentifier = await findAssetBy({ identifier: "ETH.ETH" });
    expect(assetByIdentifier).toBe("ETH.ETH");
  });

  test("find asset by chain and contract", async () => {
    const assetByChainAndContract = await findAssetBy({
      chain: Chain.Ethereum,
      contract: "0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48",
    });
    expect(assetByChainAndContract).toBe("ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48");
  });

  test("return undefined if asset can't be found", async () => {
    const assetByIdentifier = await findAssetBy({ identifier: "ARB.NOTEXISTINGTOKEN" });
    const assetByChainAndContract = await findAssetBy({
      chain: Chain.Ethereum,
      contract: "NOTFOUND",
    });
    expect(assetByIdentifier).toBe(undefined);
    expect(assetByChainAndContract).toBe(undefined);
  });
});
