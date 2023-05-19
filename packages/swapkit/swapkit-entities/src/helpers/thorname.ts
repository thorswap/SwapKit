// 10 rune for register, 1 rune per year
// MINIMUM_REGISTRATION_FEE = 11
export const getTHORNameCost = (year: number) => {
  if (year < 0) throw new Error('Invalid number of year');
  return 10 + year;
};

export const validateTHORName = (name: string) => {
  if (name.length > 30) return false;

  const regex = /^[a-zA-Z0-9+_-]+$/g;

  return !!name.match(regex);
};
