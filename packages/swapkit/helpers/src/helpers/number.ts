// THORChain base amount is 1e8
export const DEFAULT_DECIMAL = 8;

export const formatBigIntToSafeValue = ({
  value,
  bigIntDecimal = DEFAULT_DECIMAL,
  decimal = DEFAULT_DECIMAL,
}: {
  value: bigint;
  bigIntDecimal?: number;
  decimal?: number;
}) => {
  const isNegative = value < 0n;
  let valueString = value.toString().substring(isNegative ? 1 : 0);

  const padLength = decimal - (valueString.length - 1);

  if (padLength > 0) {
    valueString = '0'.repeat(padLength) + valueString;
  }

  const decimalIndex = valueString.length - decimal;
  let decimalString = valueString.slice(-decimal);

  // Check if we need to round up
  if (parseInt(decimalString[bigIntDecimal]) >= 5) {
    // Increment the last decimal place and slice off the rest
    decimalString = `${decimalString.substring(0, bigIntDecimal - 1)}${(
      parseInt(decimalString[bigIntDecimal - 1]) + 1
    ).toString()}`;
  } else {
    // Just slice off the extra digits
    decimalString = decimalString.substring(0, bigIntDecimal);
  }

  return `${isNegative ? '-' : ''}${valueString.slice(0, decimalIndex)}.${decimalString}`.replace(
    /\.?0*$/,
    '',
  );
};
