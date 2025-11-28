import {
  createContext,
  type ReactElement,
  type ReactNode,
  useState,
  useCallback,
  useRef,
} from 'react';

import TxModalDialog from './common/TxModalDialog';

const noop = (): void => {};

export type TxModalContextType = {
  txFlow: JSX.Element | undefined;
  setTxFlow: (txFlow: TxModalContextType['txFlow'], onClose?: () => void) => void;
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
  const onClose = useRef<() => void>(noop);
  // const pathname = usePathname();

  const handleModalClose = useCallback(() => {
    onClose.current();
    onClose.current = noop;
    setFlow(undefined);
  }, []);

  const setTxFlow = useCallback(
    (newTxFlow: TxModalContextType['txFlow'], newOnClose?: () => void) => {
      setFlow((prev) => {
        if (prev === newTxFlow) return prev;

        onClose.current = newOnClose ?? noop;

        return newTxFlow;
      });
    },
    []
  );

  return (
    <TxModalContext.Provider value={{ txFlow, setTxFlow, setFullWidth }}>
      {children}

      <TxModalDialog open={!!txFlow} onClose={handleModalClose} fullWidth={fullWidth}>
        {txFlow}
      </TxModalDialog>
    </TxModalContext.Provider>
  );
};
