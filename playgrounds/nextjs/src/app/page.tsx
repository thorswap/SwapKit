"use client";
import type { AssetValue, Chain } from "@swapkit/core";
import { Check } from "lucide-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSwapKit } from "~/lib/swapKit";
import { cn } from "~/lib/utils";

export default function Swap() {
  const { balances } = useSwapKit();

  const { chains, balanceGroupedByChain } = useMemo(() => {
    const balanceGroupedByChain = balances.reduce(
      (acc, assetValue) => {
        if (!acc[assetValue.chain]) {
          acc[assetValue.chain] = [];
        }

        if (assetValue.isGasAsset || assetValue.getValue("number") > 0) {
          acc[assetValue.chain].push(assetValue);
        }

        return acc;
      },
      {} as Record<Chain, AssetValue[]>,
    );

    return { chains: Object.keys(balanceGroupedByChain) as Chain[], balanceGroupedByChain };
  }, [balances]);

  return (
    <Card className={cn("w-[600px]")}>
      <CardHeader>
        <CardTitle>Swap</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <Select>
            <SelectTrigger className="flex flex-1">
              <SelectValue placeholder="Input Asset" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) =>
                balanceGroupedByChain[chain]?.length ? (
                  <SelectGroup key={chain}>
                    <SelectLabel>{chain}</SelectLabel>
                    {balanceGroupedByChain[chain].map((assetValue) => (
                      <SelectItem key={assetValue.toString()} value={assetValue.toString()}>
                        {assetValue.getValue("number")} {assetValue.symbol}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null,
              )}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="flex flex-1">
              <SelectValue placeholder="Output Asset" />
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) =>
                balanceGroupedByChain[chain]?.length ? (
                  <SelectGroup key={chain}>
                    <SelectLabel>{chain}</SelectLabel>
                    {balanceGroupedByChain[chain].map((assetValue) => (
                      <SelectItem key={assetValue.toString()} value={assetValue.toString()}>
                        {assetValue.getValue("number")} {assetValue.symbol}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : null,
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full">
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
}
