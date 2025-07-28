import { Web3Provider } from '@ethersproject/providers';
import { SafeAppProvider } from '@safe-global/safe-apps-provider';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useEffect, useState } from 'react';

function useWeb3(): { web3?: Web3Provider } {
  const [web3, setWeb3] = useState<Web3Provider | undefined>();
  const { safe, sdk } = useSafeAppsSDK();

  useEffect(() => {
    const safeProvider = new SafeAppProvider(safe, sdk);
    const web3Instance = new Web3Provider(safeProvider);

    setWeb3(web3Instance);
  }, [safe, sdk]);

  return {
    web3,
  };
}

export default useWeb3;
