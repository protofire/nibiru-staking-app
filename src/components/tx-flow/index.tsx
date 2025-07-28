import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import TxModalDialog from './common/TxModalDialog';

const noop = (): void => {};

export type TxModalContextType = {
  txFlow: JSX.Element | undefined;
  setTxFlow: (
    txFlow: TxModalContextType['txFlow'],
    onClose?: () => void,
    shouldWarn?: boolean
  ) => void;
  setFullWidth: (fullWidth: boolean) => void;
};

export const TxModalContext = createContext<TxModalContextType>({
  txFlow: undefined,
  setTxFlow: noop,
  setFullWidth: noop,
});

export const TxModalProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [txFlow, setFlow] = useState<TxModalContextType['txFlow']>(undefined);
  const [fullWidth, setFullWidth] = useState<boolean>(false);
  const shouldWarn = useRef<boolean>(true);
  const onClose = useRef<() => void>(noop);
  const pathname = usePathname();

  const handleModalClose = useCallback(() => {
    if (shouldWarn.current) {
      shouldWarn.current = false;
      return;
    }
    onClose.current();
    onClose.current = noop;
    setFlow(undefined);
  }, []);

  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], newOnClose?: () => void, newShouldWarn?: boolean) => {
      setFlow((prev) => {
        if (prev === newTxFlow) return prev;

        onClose.current = newOnClose ?? noop;
        shouldWarn.current = newShouldWarn ?? true;

        return newTxFlow;
      });
    },
    []
  );

  useEffect(() => {
    if (txFlow) {
      handleModalClose();
    }
  }, [txFlow, pathname, handleModalClose]);

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleModalClose} fullWidth={fullWidth}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  );
};
