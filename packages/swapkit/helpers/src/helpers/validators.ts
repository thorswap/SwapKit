import { Chain } from "@swapkit/types";

// Backward compatibility
const supportedChains = [...Object.values(Chain), "TERRA"];

export function validateIdentifier(identifier = "") {
  const uppercasedIdentifier = identifier.toUpperCase();

  const [chain] = uppercasedIdentifier.split(".") as [Chain, string];
  if (supportedChains.includes(chain)) return true;

  const [synthChain] = uppercasedIdentifier.split("/") as [Chain, string];
  if (supportedChains.includes(synthChain)) return true;

  throw new Error(
    `Invalid identifier: ${identifier}. Expected format: <Chain>.<Ticker> or <Chain>.<Ticker>-<ContractAddress>`,
  );
}
