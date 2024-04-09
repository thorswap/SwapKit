"use client";

import { AssetValue, getMAYANameCost, Chain } from "@swapkit/helpers";
import { Button } from "~/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useSwapKit } from "~/lib/swapKit.ts";
// import { useSwapKit } from "~/lib/swapKit";

export default function Send() {
  // const { swapKit } = useSwapKit();
  const { swapKit, checkIfChainConnected } = useSwapKit();
  const name = "TEST_OF_SWAPKIT";

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Register MAYAName</CardTitle>
          <CardDescription>
            Do not approve the tx without changing the name in the code first ;)
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-3">
          <Button
            onClick={() => {
              if (!swapKit) {
                alert("Please init swapKit");
                return;
              }
              if (!checkIfChainConnected(Chain.Maya)) {
                alert("Please connect wallet first");
                return;
              }

              swapKit.registerMayaname({
                name,
                chain: Chain.Maya,
                address: swapKit.getAddress(Chain.Maya),
                assetValue: AssetValue.fromChainOrSignature(Chain.Maya, getMAYANameCost(1)),
              });
            }}
          >
            Register MAYAName "{name}" for 1 year
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
