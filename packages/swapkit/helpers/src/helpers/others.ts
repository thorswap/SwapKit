import { type ErrorKeys, SwapKitError } from "../modules/swapKitError";
import { Chain } from "../types";

// 10 rune for register, 1 rune per year
// MINIMUM_REGISTRATION_FEE = 11
export function getTHORNameCost(numberOfYears: number) {
  if (numberOfYears < 0)
    throw new SwapKitError({
      errorKey: "helpers_invalid_number_of_years",
      info: { numberOfYears },
    });
  return 10 + numberOfYears;
}

// 10 CACAO for register
// 1.0512 CACAO per year
export function getMAYANameCost(numberOfYears: number) {
  if (numberOfYears < 0)
    throw new SwapKitError({
      errorKey: "helpers_invalid_number_of_years",
      info: { numberOfYears },
    });
  // round to max 10 decimals
  return Math.round((10 + numberOfYears * 1.0512) * 1e10) / 1e10;
}

export function wrapWithThrow<T>(fn: () => T, errorKey?: ErrorKeys) {
  try {
    return fn();
  } catch (error) {
    if (errorKey) {
      throw new SwapKitError(errorKey, error);
    }

    return console.error(error);
  }
}

export function getChainIdentifier<T extends Chain>(chain: T) {
  switch (chain) {
    case Chain.THORChain:
      return `${chain}.RUNE`;

    case Chain.Cosmos:
      return `${chain}.ATOM`;

    case Chain.BinanceSmartChain:
      return `${chain}`;

    default:
      return `${chain}.${chain}`;
  }
}

const skipWarnings = ["production", "test"].includes(process.env.NODE_ENV || "");
const warnings = new Set();
export function warnOnce(condition: boolean, warning: string) {
  if (!skipWarnings && condition) {
    if (warnings.has(warning)) {
      return;
    }

    warnings.add(warning);
    console.warn(warning);
  }
}
