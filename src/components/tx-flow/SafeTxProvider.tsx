import type { SafeTransaction } from '@safe-global/safe-core-sdk-types';
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk';
import { createContext, useState, useEffect } from 'react';
import type { Dispatch, ReactNode, SetStateAction, ReactElement } from 'react';

export const SafeTxContext = createContext<{
  safeTx?: SafeTransaction;
  setSafeTx: Dispatch<SetStateAction<SafeTransaction | undefined>>;

  safeMessage?: EIP712TypedData;
  setSafeMessage: Dispatch<SetStateAction<EIP712TypedData | undefined>>;

  safeTxError?: Error;
  setSafeTxError: Dispatch<SetStateAction<Error | undefined>>;
}>({
  setSafeTx: () => {},
  setSafeMessage: () => {},
  setSafeTxError: () => {},
});

const SafeTxProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [safeTx, setSafeTx] = useState<SafeTransaction>();
  const [safeMessage, setSafeMessage] = useState<EIP712TypedData>();
  const [safeTxError, setSafeTxError] = useState<Error>();

  useEffect(() => {
    if (safeTxError) console.error(safeTxError);
  }, [safeTxError]);

  return (
    <SafeTxContext.Provider
      value={{
        safeTx,
        safeTxError,
        setSafeTx,
        setSafeTxError,
        safeMessage,
        setSafeMessage,
      }}
    >
      {children}
    </SafeTxContext.Provider>
  );
};

export default SafeTxProvider;
