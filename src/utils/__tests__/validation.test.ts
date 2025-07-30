import { validateAmount, validateLimitedAmount, validateDecimalLength } from '../validation';

jest.mock('../addresses', () => ({
  isChecksummedAddress: jest.fn(),
}));

describe('validateAmount', () => {
  it('should return undefined for valid positive amount', () => {
    expect(validateAmount('100')).toBeUndefined();
    expect(validateAmount('0.1')).toBeUndefined();
  });

  it('should return error for non-numeric value', () => {
    expect(validateAmount('abc')).toBe('The value must be a number');
    expect(validateAmount('')).toBe('The value must be a number');
    expect(validateAmount(undefined)).toBe('The value must be a number');
  });

  it('should return error for zero by default', () => {
    expect(validateAmount('0')).toBe('The value must be greater than 0');
  });

  it('should allow zero when includingZero is true', () => {
    expect(validateAmount('0', true)).toBeUndefined();
  });

  it('should return error for negative values', () => {
    expect(validateAmount('-1')).toBe('The value must be greater than 0');
    expect(validateAmount('-1', true)).toBe('The value must be greater than 0');
  });
});

describe('validateLimitedAmount', () => {
  it('should return undefined when amount is within limits', () => {
    expect(validateLimitedAmount('100', 18, '200000000000000000000')).toBeUndefined();
  });

  it('should return undefined when parameters are missing', () => {
    expect(validateLimitedAmount('100')).toBeUndefined();
    expect(validateLimitedAmount('100', 18)).toBeUndefined();
  });

  it('should return error when amount exceeds max', () => {
    expect(validateLimitedAmount('300', 18, '200000000000000000000')).toMatch(/Maximum value is/);
  });

  it('should return error for invalid number', () => {
    expect(validateLimitedAmount('abc', 18, '200000000000000000000')).toBe(
      'The value must be a number'
    );
  });
});

describe('validateDecimalLength', () => {
  it('should return undefined when decimals are within range', () => {
    expect(validateDecimalLength('123.456', 3)).toBeUndefined();
    expect(validateDecimalLength('123.45', 3, 2)).toBeUndefined();
  });

  it('should return undefined when no maxLen is provided', () => {
    expect(validateDecimalLength('123.456')).toBeUndefined();
  });

  it('should return undefined when value has no decimals', () => {
    expect(validateDecimalLength('123', 3)).toBeUndefined();
  });

  it('should return error when decimals exceed maxLen', () => {
    expect(validateDecimalLength('123.4567', 3)).toBe('Should have 1 to 3 decimals');
  });

  it('should return error when decimals are less than minLen', () => {
    expect(validateDecimalLength('123.4', 3, 2)).toBe('Should have 2 to 3 decimals');
  });

  it('should return error when decimals are not allowed', () => {
    expect(validateDecimalLength('123.4', 0)).toBe('Should not have decimals');
  });
});
