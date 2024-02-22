"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

const items = [
  { name: "Swap", href: "/" },
  { name: "Send", href: "/send" },
  // { name: "TNS", href: "/tns" },
];

interface NavigationBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NavigationBar({ className, ...props }: NavigationBarProps) {
  const pathname = usePathname();

  return (
    <div className="relative pt-4">
      {/* @ts-expect-error */}
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center", className)} {...props}>
          {items.map(({ href, name }) => (
            <Link
              href={href}
              key={href}
              className={cn(
                "flex h-10 items-center justify-center rounded-full px-4 text-center transition-colors hover:text-primary",
                pathname === href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
              )}
            >
              {name}
            </Link>
          ))}
        </div>

        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
