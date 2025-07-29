import { NIBIRU_EVM_ADDR, ST_NIBI_TOKEN_ADDR } from '@/config/nibiruEvm';

import {
  encodeStake,
  encodeUnstake,
  encodeRedeem,
  encodeGetStNibiBalance,
  encodeGetStNibiAllowance,
  encodeStNibiApprove,
  encodeStNibiTransfer,
} from '../nibiruEvm';

describe('Nibiru EVM utilities', () => {
  const mockUserAddress = '0x1234567890123456789012345678901234567890';

  describe('encodeStake', () => {
    it('should encode stake transaction', () => {
      const result = encodeStake('420');

      expect(result.to).toBe(NIBIRU_EVM_ADDR);
      expect(result.value).toBeDefined();
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });

    it('should throw error for zero amount', () => {
      expect(() => encodeStake('0')).toThrow('Amount must be greater than 0');
    });

    it('should throw error for empty amount', () => {
      expect(() => encodeStake('')).toThrow('Amount must be greater than 0');
    });
  });

  describe('encodeUnstake', () => {
    it('should encode unstake transaction', () => {
      const result = encodeUnstake('100');

      expect(result.to).toBe(NIBIRU_EVM_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });

    it('should throw error for zero amount', () => {
      expect(() => encodeUnstake('0')).toThrow('stAmount must be greater than 0');
    });

    it('should throw error for empty amount', () => {
      expect(() => encodeUnstake('')).toThrow('stAmount must be greater than 0');
    });
  });

  describe('encodeRedeem', () => {
    it('should encode redeem transaction', () => {
      const result = encodeRedeem();

      expect(result.to).toBe(NIBIRU_EVM_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });

  describe('encodeGetStNibiBalance', () => {
    it('should encode balance query', () => {
      const result = encodeGetStNibiBalance(mockUserAddress);

      expect(result.to).toBe(ST_NIBI_TOKEN_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });

  describe('encodeGetStNibiAllowance', () => {
    it('should encode allowance query', () => {
      const result = encodeGetStNibiAllowance(mockUserAddress, NIBIRU_EVM_ADDR);

      expect(result.to).toBe(ST_NIBI_TOKEN_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });

  describe('encodeStNibiApprove', () => {
    it('should encode approve transaction', () => {
      const result = encodeStNibiApprove(NIBIRU_EVM_ADDR, '100');

      expect(result.to).toBe(ST_NIBI_TOKEN_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });

    it('should throw error for zero amount', () => {
      expect(() => encodeStNibiApprove(NIBIRU_EVM_ADDR, '0')).toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for empty amount', () => {
      expect(() => encodeStNibiApprove(NIBIRU_EVM_ADDR, '')).toThrow(
        'Amount must be greater than 0'
      );
    });
  });

  describe('encodeStNibiTransfer', () => {
    it('should encode transfer transaction', () => {
      const result = encodeStNibiTransfer(mockUserAddress, '50');

      expect(result.to).toBe(ST_NIBI_TOKEN_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });

    it('should throw error for zero amount', () => {
      expect(() => encodeStNibiTransfer(mockUserAddress, '0')).toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for empty amount', () => {
      expect(() => encodeStNibiTransfer(mockUserAddress, '')).toThrow(
        'Amount must be greater than 0'
      );
    });
  });
});
