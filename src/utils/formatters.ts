import type { BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers';

import { formatAmount } from './formatNumber';

const GWEI = 'gwei';

export const _removeTrailingZeros = (value: string): string => {
  // Match `.000` or `.01000`
  return value.replace(/\.0+$/, '').replace(/(\..*?)0+$/, '$1');
};

/**
 * Converts value to raw, specified decimal precision
 * @param value value in unspecified unit
 * @param decimals decimals of the specified value or unit name
 * @returns value at specified decimals, i.e. 0.000000000000000001
 */
export const safeFormatUnits = (value: BigNumberish, decimals: number | string = GWEI): string => {
  try {
    const formattedAmount = formatUnits(value, decimals);

    // ethers' `formatFixed` doesn't remove trailing 0s and using `parseFloat` can return exponentials
    return _removeTrailingZeros(formattedAmount);
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
