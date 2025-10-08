'use client';

// import { erisEvmRunner } from '@nibiruchain/evm-core';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
// import { ethers } from 'ethers';
import { useEffect } from 'react';

import { POLLING_INTERVAL } from '@/config/constants';
import { encodeGetStNibiBalance } from '@/utils/nibiruEvm';

import useWeb3 from './useWeb3';

export interface NibiruEvmResponse {
  nibiBalance: string;
  stNibiBalance: string;
  canRedeem: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
}

export const useLoadNibiruEvm = (): UseQueryResult<NibiruEvmResponse, Error> => {
  const { safe } = useSafeAppsSDK();
  const { web3: web3ReadOnly } = useWeb3();

  const query = useQuery<NibiruEvmResponse, Error>({
    queryKey: ['nibiruEvm', safe.safeAddress, web3ReadOnly],
    queryFn: async () => {
      if (!safe.safeAddress || !web3ReadOnly) {
        return {
          nibiBalance: '0',
          stNibiBalance: '0',
          canRedeem: false,
        };
      }

      try {
        // Get native NIBI balance
        const nibiBalance = await web3ReadOnly.getBalance(safe.safeAddress);

        // Get stNIBI balance from separate stNIBI token contract
        const stNibiBalanceCall = await web3ReadOnly.call(
          encodeGetStNibiBalance(safe.safeAddress, safe.chainId)
        );

        // const privateKey = '0x0c29a4ab2d4081533a9bc5d6ad4a11e06a8e8b1281fcba5ef3da6da58c9e0db0'; // Replace with your actual private key
        // const provider = new ethers.JsonRpcProvider('https://evm-rpc.nibiru.fi'); // Replace with your RPC endpoint
        // const signer = new ethers.Wallet(privateKey, provider);
        // const erisEvmCaller = erisEvmRunner(signer);
        // const stateBz = await erisEvmCaller.state();
        // console.debug('stateBz:', stateBz);
        // const stateJson = Buffer.from(stateBz.slice(2), 'hex').toString('utf8');
        // console.debug('stateJson:', stateJson);
        // const state = JSON.parse(stateJson);
        // console.debug('state:', state);

        return {
          nibiBalance: nibiBalance.toString(),
          stNibiBalance: stNibiBalanceCall || '0',
          canRedeem: Boolean(stNibiBalanceCall && stNibiBalanceCall !== '0'),
          state: {},
        };
      } catch (error) {
        console.error('Failed to fetch Nibiru EVM data:', error);
        throw new Error('Failed to fetch staking data');
      }
    },
    refetchInterval: POLLING_INTERVAL,
    enabled: !!safe.safeAddress && !!web3ReadOnly,
  });

  useEffect(() => {
    if (query.error) {
      console.error('Nibiru EVM data fetch failed', query.error.message);
    }
  }, [query.error]);

  return query;
};
