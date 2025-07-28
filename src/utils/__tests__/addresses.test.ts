import { isChecksummedAddress } from '../addresses';

describe('isChecksummedAddress', () => {
  it('should return true for valid checksummed addresses', () => {
    const validAddresses = [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ];

    validAddresses.forEach((address) => {
      expect(isChecksummedAddress(address)).toBe(true);
    });
  });

  it('should return false for non-checksummed but valid addresses', () => {
    const nonChecksummedAddresses = [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    ];

    nonChecksummedAddresses.forEach((address) => {
      expect(isChecksummedAddress(address)).toBe(false);
    });
  });

  it('should return false for invalid addresses', () => {
    const invalidAddresses = [
      '',
      'not an address',
      '0x123', // too short
      '0xinvalid',
      '0x1234567890123456789012345678901234567890123', // too long
      null,
      undefined,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2X', // invalid character
    ];

    invalidAddresses.forEach((address) => {
      // @ts-expect-error Testing invalid types
      expect(isChecksummedAddress(address)).toBe(false);
    });
  });

  it('should handle addresses with all lowercase or uppercase letters', () => {
    const addresses = ['0x0000000000000000000000000000000000000000'];

    addresses.forEach((address) => {
      expect(isChecksummedAddress(address)).toBe(true);
    });
  });
});
