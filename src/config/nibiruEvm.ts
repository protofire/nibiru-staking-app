import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk';
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk';

/** NIBIRU_EVM_ADDR: Proxy address for a contract points to an NibiruEvm.sol impl */
export const NIBIRU_EVM_ADDR = '0xF8647cB104e87fFf4B886dC6BB9F2F01596d400D';

export interface NibiruEvmResponse {
  nibiBalance: string;
  stNibiBalance: string;
  unstakingRequests: UnstakingRequest[];
  canRedeem: boolean;
}

export interface UnstakingRequest {
  amount: string;
  timestamp: number;
  isReady: boolean;
}

// NIBI token configuration
export const NIBI_TOKEN: TokenInfo = {
  type: TokenType.NATIVE_TOKEN,
  decimals: 18,
  symbol: 'NIBI',
  name: 'Nibiru Token',
  logoUri: '/0x4300000000000000000000000000000000000002.png',
  address: '0x0000000000000000000000000000000000000000', // Native token placeholder
};

// stNIBI token configuration (liquid staked NIBI)
export const ST_NIBI_TOKEN: TokenInfo = {
  type: TokenType.ERC20,
  decimals: 18,
  symbol: 'stNIBI',
  name: 'Staked Nibiru Token',
  logoUri: '/proto-logo.svg',
  address: NIBIRU_EVM_ADDR, // The stNIBI is minted by the same contract
};

// Minimum staking amount (1 microNIBI = 10^12 wei)
export const MIN_STAKE_AMOUNT = BigInt(1e12);

// Convert amount to microNIBI (multiply by 10^12)
export const toMicroNibi = (amount: number): bigint => {
  return BigInt(amount) * BigInt(1e12);
};
