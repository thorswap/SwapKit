// Import the necessary testing libraries
import { describe, expect, test } from "bun:test";
import { getPrice } from "../src/thorswapApiV2/endpoints";

describe("getPrice", () => {
  const payload = {
    tokens: [{ identifier: "ARB.ETH" }, { identifier: "DASH.DASH" }],
    metadata: false,
  };

  test("should return the correct response", async () => {
    const response = await getPrice(payload);
    for (const item of response) {
      expect(item.identifier).toBeString();
      expect(item.provider).toBeString();
      expect(item.price_usd).toBeNumber();
      expect(item.timestamp).toBeNumber();
    }
  });
});
