import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Dialog, DialogTitle, type DialogProps } from '@mui/material';
import classnames from 'classnames';
import { type ReactElement } from 'react';

import css from './styles.module.css';

interface ModalDialogProps extends DialogProps {
  children: React.ReactNode;
  fullScreen?: boolean;
}

const TxModalDialog = ({
  children,
  onClose,
  fullScreen = false,
  fullWidth = false,
  ...restProps
}: ModalDialogProps): ReactElement => {
  return (
    <Dialog
      {...restProps}
      fullScreen={true}
      scroll={fullScreen ? 'paper' : 'body'}
      className={classnames(css.dialog, fullWidth ? css.fullWidth : '')}
      onClick={(e) => e.stopPropagation()}
      hideBackdrop
      PaperProps={{
        className: css.paper,
      }}
    >
      <DialogTitle className={css.title}>
        <div className={css.buttons}>
          <IconButton
            className={css.close}
            aria-label="close"
            onClick={(e) => {
              onClose?.(e, 'escapeKeyDown');
            }}
            size="small"
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </div>
      </DialogTitle>

      {children}
    </Dialog>
  );
};

export default TxModalDialog;
