import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk';
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk';

/** NIBIRU_EVM_ADDR: Proxy address for a contract points to an NibiruEvm.sol impl */
export const NIBIRU_EVM_ADDR = '0x38039867f99B18bf2b14C592A5cb4791403C2C12';

/** ST_NIBI_TOKEN_ADDR: Mock address for the stNIBI ERC20 token contract */
export const ST_NIBI_TOKEN_ADDR = '0x62C054E4D7f8e066596Cd7A55DB0881E529ec00C';

export interface NibiruEvmResponse {
  nibiBalance: string;
  stNibiBalance: string;
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
  address: ST_NIBI_TOKEN_ADDR, // Separate ERC20 token contract for stNIBI
};

// Minimum staking amount (1 microNIBI = 10^12 wei)
export const MIN_STAKE_AMOUNT = 1e12;

// Convert amount to microNIBI (multiply by 10^12)
export const toWei = (amount: number): number => {
  return amount * 1e18;
};
