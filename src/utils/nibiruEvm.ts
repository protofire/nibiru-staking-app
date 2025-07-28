import type { TransactionRequest } from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import type { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { Interface } from 'ethers';

import { NIBIRU_EVM_ADDR } from '@/config/nibiruEvm';
import { safeParseUnits } from '@/utils/formatters';

/**
 * Encode stake transaction
 * @param amount - Amount of NIBI to stake in string format (e.g., "420")
 * @returns Transaction data for staking
 */
export const encodeStake = (amount: string): SafeTransactionDataPartial => {
  if (!amount || Number(amount) <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const functionABI = 'function liquidStake(uint256 amount) external';
  const stakeInterface = new Interface([functionABI]);

  // Convert amount to microNIBI (multiply by 10^12)
  const stakeAmount = safeParseUnits(amount, 18)?.toString() || '0';

  return {
    to: NIBIRU_EVM_ADDR,
    value: stakeAmount, // Send NIBI as value
    data: stakeInterface.encodeFunctionData('liquidStake', [stakeAmount]),
  };
};

/**
 * Encode unstake transaction
 * @param stAmount - Amount of stNIBI to unstake in string format
 * @returns Transaction data for unstaking
 */
export const encodeUnstake = (stAmount: string): SafeTransactionDataPartial => {
  if (!stAmount || Number(stAmount) <= 0) {
    throw new Error('stAmount must be greater than 0');
  }

  const functionABI = 'function unstake(uint256 stAmount) external';
  const unstakeInterface = new Interface([functionABI]);

  const parsedAmount = safeParseUnits(stAmount, 18)?.toString() || '0';

  return {
    to: NIBIRU_EVM_ADDR,
    value: '0',
    data: unstakeInterface.encodeFunctionData('unstake', [parsedAmount]),
  };
};

/**
 * Encode redeem transaction
 * @returns Transaction data for redeeming unstaked tokens
 */
export const encodeRedeem = (): SafeTransactionDataPartial => {
  const functionABI = 'function redeem() external';
  const redeemInterface = new Interface([functionABI]);

  return {
    to: NIBIRU_EVM_ADDR,
    value: '0',
    data: redeemInterface.encodeFunctionData('redeem', []),
  };
};

/**
 * Encode call to get stNIBI balance
 * @param userAddress - Address to check balance for
 * @returns Transaction request for balance query
 */
export const encodeGetStNibiBalance = (userAddress: string): Deferrable<TransactionRequest> => {
  const functionABI = 'function balanceOf(address account) external view returns (uint256)';
  const balanceInterface = new Interface([functionABI]);

  return {
    to: NIBIRU_EVM_ADDR,
    value: '0',
    data: balanceInterface.encodeFunctionData('balanceOf', [userAddress]),
  };
};

/**
 * Encode call to get exchange rate (stNIBI to NIBI)
 * @returns Transaction request for exchange rate query
 */
export const encodeGetExchangeRate = (): Deferrable<TransactionRequest> => {
  // This would need to be implemented based on the actual contract ABI
  // For now, assuming a simple view function exists
  const functionABI = 'function getExchangeRate() external view returns (uint256)';
  const exchangeRateInterface = new Interface([functionABI]);

  return {
    to: NIBIRU_EVM_ADDR,
    value: '0',
    data: exchangeRateInterface.encodeFunctionData('getExchangeRate', []),
  };
};
