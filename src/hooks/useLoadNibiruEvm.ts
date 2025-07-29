'use client';

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';

import { POLLING_INTERVAL } from '@/config/constants';
import { type NibiruEvmResponse } from '@/config/nibiruEvm';
import { encodeGetStNibiBalance } from '@/utils/nibiruEvm';

import useWeb3 from './useWeb3';

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
        const stNibiBalanceCall = await web3ReadOnly.call(encodeGetStNibiBalance(safe.safeAddress));

        return {
          nibiBalance: nibiBalance.toString(),
          stNibiBalance: stNibiBalanceCall || '0',
          canRedeem: true, // TODO: Implement if contract supports querying redeem status
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
