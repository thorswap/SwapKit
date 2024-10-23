"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { Button } from "../ui/button";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun class="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon class="hidden h-5 w-5 dark:block" />
      <span class="sr-only">Toggle theme</span>
    </Button>
  );
}
