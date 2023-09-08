export const DEFAULT_DECIMAL = 8;

export const decimalFromMultiplier = (multiplier: bigint) =>
  Math.log10(parseFloat(multiplier.toString()));

export const formatBigIntToSafeValue = (value: bigint, decimal?: number) => {
  const decimalToUseForConversion = decimal || DEFAULT_DECIMAL;
  const isNegative = value < 0n;

  let valueString = value.toString().substring(isNegative ? 1 : 0);

  const padLength = decimalToUseForConversion - (valueString.length - 1);

  if (padLength > 0) {
    valueString = '0'.repeat(padLength) + valueString;
  }

  const decimalIndex = valueString.length - decimalToUseForConversion;
  let decimalString = valueString.slice(-decimalToUseForConversion);

  // Check if we need to round up
  if (parseInt(decimalString[decimalToUseForConversion]) >= 5) {
    // Increment the last decimal place and slice off the rest
    decimalString = `${decimalString.substring(0, decimalToUseForConversion - 1)}${(
      parseInt(decimalString[decimalToUseForConversion - 1]) + 1
    ).toString()}`;
  } else {
    // Just slice off the extra digits
    decimalString = decimalString.substring(0, decimalToUseForConversion);
  }

  return `${isNegative ? '-' : ''}${valueString.slice(0, decimalIndex)}.${decimalString}`.replace(
    /\.?0*$/,
    '',
  );
};
