import { describe, expect, test } from "bun:test";
import { APIV1RequestClient } from "../endpoints";

describe("ApiV1 error handling", () => {
  test("Expected error", async () => {
    const expectedError = await APIV1RequestClient.get(
      "https://api.thorswap.finance/aggregator/tokens/quote?sellAsset=ETH.00-0X881BA05DE1E78F549CC63A8F6CABB1D4AD32250D&sellAmount=1.12&buyAsset=ETH.ETH&senderAddress=0x494447b317d2ee41d4c02600edb7c2193b2c9085&recipientAddress=0x494447b317d2ee41d4c02600edb7c2193b2c9085&slippage=3",
    );

    expect(expectedError).toHaveProperty("status", 400);
    expect(expectedError).toHaveProperty("identifier", "REQUEST_PARAMETER_ERROR-1003-2012");
  });
});
