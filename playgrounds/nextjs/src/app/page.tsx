"use client";

import { Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
// import { useSwapKit } from "~/lib/swapKit";
import { cn } from "~/lib/utils";

export default function Swap() {
  // const { balances, swapKit, checkIfChainConnected } = useSwapKit();

  return (
    <Card className={cn("w-[600px]")}>
      <CardHeader>
        <CardTitle>Swap</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">a</div>
      </CardContent>

      <CardFooter>
        <Button className="w-full">
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  );
}
