import { formatAmount } from '../formatNumber';

describe('formatNumber', () => {
  describe('formatAmount', () => {
    it('should format zero correctly', () => {
      expect(formatAmount('0')).toBe('0');
      expect(formatAmount(0)).toBe('0');
    });

    it('should format small numbers correctly', () => {
      expect(formatAmount('0.00001')).toBe('0.00001');
      expect(formatAmount('0.000001')).toBe('< 0.00001');
    });

    it('should format large numbers correctly', () => {
      expect(formatAmount('1000000')).toBe('1,000,000');
      expect(formatAmount('1000000000')).toBe('1B');
    });

    it('should handle negative numbers correctly', () => {
      expect(formatAmount('-1000')).toBe('-1,000');
      expect(formatAmount('-0.00001')).toBe('-0.00001');
      expect(formatAmount('-0.000001')).toBe('< -0.00001');
    });

    it('should respect precision parameter', () => {
      expect(formatAmount('1.23456', 2)).toBe('1.23');
      expect(formatAmount('1.23456', 4)).toBe('1.2346');
    });
  });
});
