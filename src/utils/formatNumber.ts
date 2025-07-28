// https://github.com/5afe/safe/wiki/How-to-format-amounts
const LOWER_LIMIT = 0.00001;
const COMPACT_LIMIT = 99_999_999.5;
const UPPER_LIMIT = 999 * 10 ** 12;

/**
 * Formatter that restricts the upper and lower limit of numbers that can be formatted
 * @param number Number to format
 * @param formatter Function to format number
 * @param minimum Minimum number to format
 */
const format = (
  number: string | number,
  formatter: (float: number) => string,
  minimum = LOWER_LIMIT
): string => {
  const float = Number(number);

  if (float === 0) {
    return formatter(float);
  }

  if (Math.abs(float) < minimum) {
    return `< ${formatter(minimum * Math.sign(float))}`;
  }

  if (float < UPPER_LIMIT) {
    return formatter(float);
  }

  return `> ${formatter(UPPER_LIMIT)}`;
};

// Universal amount formatting options

const getNumberFormatNotation = (number: string | number): Intl.NumberFormatOptions['notation'] => {
  return Number(number) >= COMPACT_LIMIT ? 'compact' : undefined;
};

const getNumberFormatSignDisplay = (
  number: string | number
): Intl.NumberFormatOptions['signDisplay'] => {
  const shouldDisplaySign =
    typeof number === 'string' ? number.trim().startsWith('+') : Number(number) < 0;
  return shouldDisplaySign ? 'exceptZero' : undefined;
};

// Amount formatting options

const getAmountFormatterMaxFractionDigits = (
  number: string | number
): Intl.NumberFormatOptions['maximumFractionDigits'] => {
  const float = Number(number);

  if (float < 1_000) {
    return 5;
  }

  if (float < 10_000) {
    return 4;
  }

  if (float < 100_000) {
    return 3;
  }

  if (float < 1_000_000) {
    return 2;
  }

  if (float < 10_000_000) {
    return 1;
  }

  if (float < COMPACT_LIMIT) {
    return 0;
  }

  // Represents numbers like 767.343M
  if (float < UPPER_LIMIT) {
    return 3;
  }

  return 0;
};

const getAmountFormatterOptions = (number: string | number): Intl.NumberFormatOptions => {
  return {
    maximumFractionDigits: getAmountFormatterMaxFractionDigits(number),
    notation: getNumberFormatNotation(number),
    signDisplay: getNumberFormatSignDisplay(number),
  };
};

/**
 * Intl.NumberFormat number formatter that adheres to our style guide
 * @param number Number to format
 */
export const formatAmount = (number: string | number, precision?: number): string => {
  const options = getAmountFormatterOptions(number);
  if (precision !== undefined) {
    options.maximumFractionDigits = precision;
  }
  const formatter = new Intl.NumberFormat(undefined, options);

  return format(number, formatter.format);
};
