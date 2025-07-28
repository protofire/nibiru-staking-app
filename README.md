# Nibiru Staking Safe App

A Safe app for interacting with the Nibiru EVM staking contract on Nibiru. This application allows users to stake NIBI tokens, unstake stNIBI tokens, and redeem unstaked tokens through the Safe multisig interface.

## Features

- **Stake**: Deposit NIBI to stake and mint stNIBI
- **Unstake**: Queue stNIBI to unstake for later redemption
- **Redeem**: Redeem unstaked stNIBI for NIBI principal + accrued rewards (converted to WNIBI)

## Contract Integration

The app integrates with the Nibiru EVM contract at address `0xF8647cB104e87fFf4B886dC6BB9F2F01596d400D` which provides three main functions:

```solidity
contract NibiruEvm {
  /// @notice Deposit NIBI to stake and mint stNIBI.
  function liquidStake(uint256 amount) external {}

  /// @notice Queue to unstake stNIBI to later redeem it for the principal and
  /// accrued rewards from staking.
  function unstake(uint256 stAmount) external {}

  /// @notice Redeem any stNIBI that has finished unstaking to receive the NIBI
  /// principal and any accrued rewards from staking. NIBI received is
  /// converted to WNIBI.
  function redeem() external {}
}
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Connect Safe**: The app automatically connects to your Safe wallet
2. **View Balances**: See your NIBI and stNIBI balances
3. **Liquid Stake**: Click "Liquid Stake" to deposit NIBI and receive stNIBI
4. **Unstake**: Click "Unstake" to queue stNIBI for redemption
5. **Redeem**: Click "Redeem" when tokens are ready to be redeemed

## Development

The project structure:

- `/src/config/nibiruEvm.ts` - Contract addresses and configuration
- `/src/utils/nibiruEvm.ts` - Contract interaction utilities
- `/src/hooks/useLoadNibiruEvm.ts` - React hook for loading contract data
- `/src/components/tx-flow/flows/` - Transaction flow components
- `/src/app/page.tsx` - Main application interface

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Building

Build the application:

```bash
npm run build
```
