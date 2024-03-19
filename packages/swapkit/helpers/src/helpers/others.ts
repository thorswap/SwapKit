// 10 rune for register, 1 rune per year
// MINIMUM_REGISTRATION_FEE = 11
export function getTHORNameCost(year: number) {
  if (year < 0) throw new Error("Invalid number of year");
  return 10 + year;
}

// 10 CACAO for register
// 1.0512 CACAO per year
export function getMAYANameCost(year: number) {
  if (year < 0) throw new Error("Invalid number of year");
  // round to max 10 decimals
  return Math.round((10 + year * 1.0512) * 1e10) / 1e10;
}

export function validateTHORName(name: string) {
  if (name.length > 30) return false;

  const regex = /^[a-zA-Z0-9+_-]+$/g;

  return !!name.match(regex);
}

export function validateMAYAName(name: string) {
  if (name.length > 30) return false;

  const regex = /^[a-zA-Z0-9+_-]+$/g;

  return !!name.match(regex);
}

export function derivationPathToString([network, chainId, account, change, index]: [
  number,
  number,
  number,
  number,
  number | undefined,
]) {
  const shortPath = typeof index !== "number";

  return `${network}'/${chainId}'/${account}'/${change}${shortPath ? "" : `/${index}`}`;
}
