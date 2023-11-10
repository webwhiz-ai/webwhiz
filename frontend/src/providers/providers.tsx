import React, { useCallback, useMemo, useState } from 'react';
import { useContext } from 'react';
import ConfirmationModal, { ConfirmationModalProps } from '../components/ConfirmationModal/ConfirmationModal';


type Props = {
  children: React.ReactNode;
};

export type ConfirmationAttributes = Omit<ConfirmationModalProps, 'isOpen'>

const confirmationDefaultValue = {
  showConfirmation: (
    open: boolean,
    confirmationModalAttrs?: ConfirmationAttributes
  ) => null
};

export const ConfirmationContext = React.createContext(
  confirmationDefaultValue
);

const ConfirmationModalProvider = ({ children }: Props) => {
  const [confirmationState, setConfirmationState] = useState(
    {} as ConfirmationAttributes
  );
  const [open, setOpen] = useState<boolean>(false);
  const showConfirmation = useCallback(
    (open: boolean, confirmationModalAttrs?: ConfirmationAttributes) => {
      if (confirmationModalAttrs) {
        setConfirmationState({ ...confirmationModalAttrs });
      }
      setOpen(open);
    },
    []
  );

  const value = useMemo(() => ({ showConfirmation }), [showConfirmation]);
  return (
    <ConfirmationContext.Provider value={value as any}>
      {children}
      {open ? (
        <ConfirmationModal
          {...confirmationState}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </ConfirmationContext.Provider>
  );
};
export const ConfirmationProvider = React.memo(ConfirmationModalProvider);

export const useConfirmation = () => useContext(ConfirmationContext);
