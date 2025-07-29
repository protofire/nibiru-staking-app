import type { BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers';

import { formatAmount } from './formatNumber';

const GWEI = 'gwei';

export const _removeTrailingZeros = (value: string): string => {
  // Match `.000` or `.01000`
  return value.replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1');
};

/**
 * Truncates a number string with ellipsis if it's too long
 * @param value - The number string to truncate
 * @param maxLength - Maximum length before truncation (default: 12)
 * @returns Truncated string with ellipsis if needed
 */
export const truncateNumber = (value: string, maxLength: number = 12): string => {
  if (value.length <= maxLength) {
    return value;
  }

  // Find the decimal point
  const decimalIndex = value.indexOf('.');

  if (decimalIndex === -1) {
    // No decimal point, truncate from the end
    return value.substring(0, maxLength - 3) + '...';
  }

  // If the integer part is already too long, truncate it
  if (decimalIndex >= maxLength - 3) {
    return value.substring(0, maxLength - 3) + '...';
  }

  // Truncate the decimal part
  const integerPart = value.substring(0, decimalIndex + 1);
  const remainingLength = maxLength - 3 - integerPart.length;

  if (remainingLength <= 0) {
    return integerPart.substring(0, maxLength - 3) + '...';
  }

  return (
    integerPart + value.substring(decimalIndex + 1, decimalIndex + 1 + remainingLength) + '...'
  );
};

/**
 * Converts value to raw, specified decimal precision with truncation for long numbers
 * @param value value in unspecified unit
 * @param decimals decimals of the specified value or unit name
 * @param truncate whether to truncate long numbers with ellipsis
 * @returns value at specified decimals, i.e. 0.000000000000000001
 */
export const safeFormatUnits = (
  value: BigNumberish,
  decimals: number | string = GWEI,
  truncate: boolean = false
): string => {
  try {
    const formattedAmount = formatUnits(value, decimals);
    const cleanAmount = _removeTrailingZeros(formattedAmount);

    // ethers' `formatFixed` doesn't remove trailing 0s and using `parseFloat` can return exponentials
    return truncate ? truncateNumber(cleanAmount) : cleanAmount;
  } catch (err) {
    console.error('Error formatting units', err);
    return '';
  }
};

/**
 * Converts value to formatted (https://github.com/5afe/safe/wiki/How-to-format-amounts), specified decimal precision
 * @param value value in unspecified unit
 * @param decimals decimals of the specified value or unit name
 * @returns value at specified decimals, formatted, i.e. -< 0.00001
 */
export const formatVisualAmount = (
  value: BigNumberish,
  decimals: number | string = GWEI,
  precision?: number
): string => {
  return formatAmount(safeFormatUnits(value, decimals), precision);
};

export const safeParseUnits = (
  value: string,
  decimals: number | string = GWEI
): bigint | undefined => {
  try {
    return parseUnits(value, decimals);
  } catch (err) {
    console.error('Error parsing units', err);
    return;
  }
};
