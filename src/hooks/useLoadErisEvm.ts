'use client';

import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';

import { POLLING_INTERVAL } from '@/config/constants';
import { type ErisEvmResponse } from '@/config/erisEvm';
import { encodeGetStNibiBalance, encodeGetExchangeRate } from '@/utils/erisEvm';

import useWeb3 from './useWeb3';

export const useLoadErisEvm = (): UseQueryResult<ErisEvmResponse, Error> => {
  const { safe } = useSafeAppsSDK();
  const { web3: web3ReadOnly } = useWeb3();

  const query = useQuery<ErisEvmResponse, Error>({
    queryKey: ['erisEvm', safe.safeAddress, web3ReadOnly],
    queryFn: async () => {
      if (!safe.safeAddress || !web3ReadOnly) {
        return {
          nibiBalance: '0',
          stNibiBalance: '0',
          unstakingRequests: [],
          canRedeem: false,
        };
      }

      try {
        // Get native NIBI balance
        const nibiBalance = await web3ReadOnly.getBalance(safe.safeAddress);

        // Get stNIBI balance
        const stNibiBalanceCall = await web3ReadOnly.call(encodeGetStNibiBalance(safe.safeAddress));

        // Get exchange rate (if available)
        try {
          await web3ReadOnly.call(encodeGetExchangeRate());
        } catch {
          console.warn('Could not fetch exchange rate, using default 1:1');
        }

        return {
          nibiBalance: nibiBalance.toString(),
          stNibiBalance: stNibiBalanceCall || '0',
          unstakingRequests: [], // TODO: Implement if contract supports querying unstaking requests
          canRedeem: false, // TODO: Implement if contract supports querying redeem status
        };
      } catch (error) {
        console.error('Failed to fetch Eris EVM data:', error);
        throw new Error('Failed to fetch liquid staking data');
      }
    },
    refetchInterval: POLLING_INTERVAL,
    enabled: !!safe.safeAddress && !!web3ReadOnly,
  });

  useEffect(() => {
    if (query.error) {
      console.error('Eris EVM data fetch failed', query.error.message);
    }
  }, [query.error]);

  return query;
};

export default useLoadErisEvm;
