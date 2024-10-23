"use client";

import { Chain, CosmosChains, EVMChains, UTXOChains, WalletOption } from "@swapkit/helpers";
import { Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useSwapKit } from "~/lib/swapKit";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

const items = [
  { name: "Swap", href: "/" },
  { name: "Send", href: "/send" },
  { name: "MAYAName", href: "/mayaname" },
  // { name: "TNS", href: "/tns" },
];

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {}

const AllChains = [...UTXOChains, ...EVMChains, ...CosmosChains];

const allowedChainsByWallet = {
  [WalletOption.XDEFI]: AllChains.filter((chain) => ![Chain.Dash].includes(chain)),
  [WalletOption.METAMASK]: EVMChains,
  [WalletOption.KEPLR]: CosmosChains,
} as const;

export function NavigationBar({ className, ...props }: NavigationBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedChains, setSelectedChains] = useState<Chain[]>([]);
  const { walletType, disconnectWallet, isWalletConnected, connectWallet } = useSwapKit();
  const pathname = usePathname();

  const handleChainSelect = (chain: Chain) => (checked: boolean) => {
    if (checked) {
      setSelectedChains((prev) => [...prev, chain]);
    } else {
      setSelectedChains((prev) => prev.filter((c) => c !== chain));
    }
  };

  const checkWalletDisabled = useCallback(
    (option: WalletOption) => {
      // @ts-expect-error
      const allowedChains = allowedChainsByWallet[option] as Chain[];

      if (!(allowedChains?.length > 0 && selectedChains?.length > 0)) return false;

      return !selectedChains.every((chain) => allowedChains.includes(chain));
    },
    [selectedChains],
  );

  const handleWalletSelect = useCallback(
    (option: WalletOption) => {
      setIsDropdownOpen(false);

      // @ts-expect-error
      const allowedChains = allowedChainsByWallet[option] as Chain[];

      if (allowedChains.length === 0 || checkWalletDisabled(option)) return;

      if (selectedChains.length === 0) {
        setSelectedChains(allowedChains);
      } else if (isWalletConnected) {
        disconnectWallet();
      } else {
        connectWallet(option, selectedChains);
      }
    },
    [checkWalletDisabled, isWalletConnected, disconnectWallet, connectWallet, selectedChains],
  );

  return (
    <ScrollArea class="max-w-[600px] lg:max-w-none pt-4 mb-4 border-b">
      <div class="flex justify-between flex-row">
        <div class={cn("mb-4 flex items-center", className)} {...props}>
          {items.map(({ href, name }) => (
            <Link
              href={href}
              key={href}
              class={cn(
                "flex h-10 items-center justify-center rounded-full px-4 text-center transition-colors hover:text-primary",
                pathname === href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {name}
            </Link>
          ))}
        </div>

        <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
          {isWalletConnected ? (
            <Button onClick={disconnectWallet} asChild variant="ghost" class="space-x-2">
              <div>
                <PowerOff size={18} class="text-red-400" />

                <span>{`Disconnect (${walletType})`}</span>
              </div>
            </Button>
          ) : (
            <DropdownMenuTrigger>
              <Button asChild variant="ghost" class="space-x-2">
                <div>
                  <Power size={18} class="text-slate-400" />

                  <span>Connect Wallet</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
          )}

          <DropdownMenuContent class="max-w-[400px] z-auto">
            <div class="flex flex-row flex-wrap bg-slate-900 p-4 gap-3">
              {AllChains.map((chain) => (
                <div key={chain} class="flex w-[70px] justify-between items-center">
                  <span
                    class={
                      selectedChains.includes(chain) ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {chain}
                  </span>

                  <Checkbox
                    checked={selectedChains.includes(chain)}
                    onCheckedChange={handleChainSelect(chain)}
                    key={chain}
                  />
                </div>
              ))}
            </div>

            <div class="bg-slate-800 p-4">
              {[WalletOption.XDEFI, WalletOption.METAMASK, WalletOption.KEPLR].map((option) => (
                <div key={option}>
                  {selectedChains.length > 0 && !checkWalletDisabled(option) ? (
                    <Button
                      onClick={() => handleWalletSelect(option)}
                      variant="ghost"
                      class="text-primary p-2"
                    >
                      Connect
                    </Button>
                  ) : null}

                  <Button
                    variant={
                      selectedChains.length > 0 && !checkWalletDisabled(option)
                        ? "default"
                        : "ghost"
                    }
                    class={checkWalletDisabled(option) ? "text-muted-foreground" : ""}
                    disabled={checkWalletDisabled(option)}
                    onClick={() => handleWalletSelect(option)}
                  >
                    {option}
                  </Button>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollBar orientation="horizontal" class="invisible" />
    </ScrollArea>
  );
}
