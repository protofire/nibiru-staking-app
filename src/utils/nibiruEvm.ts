import type { TransactionRequest } from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import type { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { Interface } from 'ethers';

import { NIBIRU_EVM_ADDRESSES, ST_NIBI_TOKEN_ADDRESSES, STNIBI_DECIMALS } from '@/config/nibiruEvm';
import { safeParseUnits } from '@/utils/formatters';

/**
 * Encode stake transaction
 * @param amount - Amount of NIBI to stake in string format (e.g., "420")
 * @param chainId - The chain ID of the network
 * @returns Transaction data for staking
 */
export const encodeStake = (amount: string, chainId: number): SafeTransactionDataPartial => {
  if (!amount || Number(amount) <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const functionABI = 'function liquidStake(uint256 amount)';
  const stakeInterface = new Interface([functionABI]);

  const stakeAmount = safeParseUnits(amount, 18)?.toString() || '0';

  const contractAddress = NIBIRU_EVM_ADDRESSES[chainId as keyof typeof NIBIRU_EVM_ADDRESSES];
  if (!contractAddress) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  return {
    to: contractAddress,
    value: '0',
    data: stakeInterface.encodeFunctionData('liquidStake', [stakeAmount]),
  };
};

/**
 * Encode unstake transaction
 * @param stAmount - Amount of stNIBI to unstake in string format
 * @param chainId - The chain ID of the network
 * @returns Transaction data for unstaking
 */
export const encodeUnstake = (stAmount: string, chainId: number): SafeTransactionDataPartial => {
  if (!stAmount || Number(stAmount) <= 0) {
    throw new Error('stAmount must be greater than 0');
  }

  const functionABI = 'function unstake(uint256 stAmount)';
  const unstakeInterface = new Interface([functionABI]);

  const parsedAmount = safeParseUnits(stAmount, STNIBI_DECIMALS)?.toString() || '0';

  const contractAddress = NIBIRU_EVM_ADDRESSES[chainId as keyof typeof NIBIRU_EVM_ADDRESSES];
  if (!contractAddress) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  return {
    to: contractAddress,
    value: '0',
    data: unstakeInterface.encodeFunctionData('unstake', [parsedAmount]),
  };
};

/**
 * Encode redeem transaction
 * @param chainId - The chain ID of the network
 * @returns Transaction data for redeeming unstaked tokens
 */
export const encodeRedeem = (chainId: number): SafeTransactionDataPartial => {
  const functionABI = 'function redeem()';
  const redeemInterface = new Interface([functionABI]);

  const contractAddress = NIBIRU_EVM_ADDRESSES[chainId as keyof typeof NIBIRU_EVM_ADDRESSES];
  if (!contractAddress) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  return {
    to: contractAddress,
    value: '0',
    data: redeemInterface.encodeFunctionData('redeem', []),
  };
};

/**
 * Encode call to get stNIBI balance
 * @param userAddress - Address to check balance for
 * @returns Transaction request for balance query
 */
export const encodeGetStNibiBalance = (
  userAddress: string,
  chainId: number
): Deferrable<TransactionRequest> => {
  const functionABI = 'function balanceOf(address account) external view returns (uint256)';
  const balanceInterface = new Interface([functionABI]);

  return {
    to: ST_NIBI_TOKEN_ADDRESSES[chainId as keyof typeof ST_NIBI_TOKEN_ADDRESSES],
    value: '0',
    data: balanceInterface.encodeFunctionData('balanceOf', [userAddress]),
  };
};
