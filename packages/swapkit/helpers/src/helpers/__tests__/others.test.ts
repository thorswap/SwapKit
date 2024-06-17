import { describe, expect, test } from "bun:test";
import { Chain, type DerivationPathArray } from "@swapkit/helpers";

import { findAssetBy } from "../asset.ts";
import { derivationPathToString, getTHORNameCost } from "../others.ts";

describe("derivationPathToString", () => {
  test("should return the correct string for a full path", () => {
    const path = [1, 2, 3, 4, 5] as DerivationPathArray;
    expect(derivationPathToString(path)).toEqual("m/1'/2'/3'/4/5");
  });

  test("should return the correct string for a short path", () => {
    const path = [1, 2, 3, 4] as DerivationPathArray;
    expect(derivationPathToString(path)).toEqual("m/1'/2'/3'/4");
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

    for (const [years = 0, expected = 10] of costCases) {
      test(`returns correct ${expected} cost for ${years} years`, () => {
        const result = getTHORNameCost(years);
        expect(result).toBe(expected);
      });
    }
  });

  test("throws an error for negative years", () => {
    expect(() => getTHORNameCost(-1)).toThrow("Invalid number of year");
  });
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
    expect(assetByIdentifier).toBeUndefined();
    expect(assetByChainAndContract).toBeUndefined();
  });
});
