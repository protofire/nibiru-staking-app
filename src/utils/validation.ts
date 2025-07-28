import { isChecksummedAddress } from './addresses';
import { safeFormatUnits, safeParseUnits } from './formatters';

export const validateAddress = (address: string): string | undefined => {
  const ADDRESS_RE = /^0x[0-9a-f]{40}$/i;

  if (!ADDRESS_RE.test(address)) {
    return 'Invalid address format';
  }

  if (!isChecksummedAddress(address)) {
    return 'Invalid address checksum';
  }

  return undefined;
};

export const validateAmount = (
  amount?: string,
  includingZero: boolean = false
): string | undefined => {
  if (!amount || isNaN(Number(amount))) {
    return 'The value must be a number';
  }

  if (includingZero ? parseFloat(amount) < 0 : parseFloat(amount) <= 0) {
    return 'The value must be greater than 0';
  }

  return undefined;
};

export const validateLimitedAmount = (
  amount: string,
  decimals?: number,
  max?: string
): string | undefined => {
  if (typeof decimals === 'undefined' || !max) return;

  const numberError = validateAmount(amount);
  if (numberError) {
    return numberError;
  }

  const value = safeParseUnits(amount, decimals);

  if (value !== undefined && value > BigInt(max)) {
    return `Maximum value is ${safeFormatUnits(max, decimals)}`;
  }

  return undefined;
};

export const validateDecimalLength = (
  value: string,
  maxLen?: number,
  minLen = 1
): string | undefined => {
  if (typeof maxLen === 'undefined' || !value.includes('.')) {
    return undefined;
  }

  if (maxLen === 0) {
    return 'Should not have decimals';
  }

  const decimals = value.split('.')[1] || '';

  if (decimals.length < +minLen || decimals.length > +maxLen) {
    return `Should have ${minLen} to ${maxLen} decimals`;
  }

  return undefined;
};
