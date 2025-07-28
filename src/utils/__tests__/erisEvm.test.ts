import { ERIS_EVM_ADDR } from '@/config/erisEvm';

import {
  encodeLiquidStake,
  encodeUnstake,
  encodeRedeem,
  encodeGetStNibiBalance,
  encodeGetExchangeRate,
} from '../erisEvm';

describe('Eris EVM utilities', () => {
  const mockUserAddress = '0x1234567890123456789012345678901234567890';

  describe('encodeLiquidStake', () => {
    it('should encode liquid stake transaction', () => {
      const result = encodeLiquidStake('420');

      expect(result.to).toBe(ERIS_EVM_ADDR);
      expect(result.value).toBeDefined();
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });

    it('should throw error for zero amount', () => {
      expect(() => encodeLiquidStake('0')).toThrow('Amount must be greater than 0');
    });

    it('should throw error for empty amount', () => {
      expect(() => encodeLiquidStake('')).toThrow('Amount must be greater than 0');
    });
  });

  describe('encodeUnstake', () => {
    it('should encode unstake transaction', () => {
      const result = encodeUnstake('100');

      expect(result.to).toBe(ERIS_EVM_ADDR);
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

      expect(result.to).toBe(ERIS_EVM_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });

  describe('encodeGetStNibiBalance', () => {
    it('should encode balance query', () => {
      const result = encodeGetStNibiBalance(mockUserAddress);

      expect(result.to).toBe(ERIS_EVM_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });

  describe('encodeGetExchangeRate', () => {
    it('should encode exchange rate query', () => {
      const result = encodeGetExchangeRate();

      expect(result.to).toBe(ERIS_EVM_ADDR);
      expect(result.value).toBe('0');
      expect(result.data).toContain('0x'); // Should contain encoded function call
    });
  });
});
