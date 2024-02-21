"use client";

import { Provider as JotaiProvider } from "jotai";
import type { PropsWithChildren } from "react";

import { ThemeProvider } from "./containers/Theme";
import { TooltipProvider } from "./ui/tooltip";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <div className="max-w-1/2 mx-auto">{children}</div>
        </TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
