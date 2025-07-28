import { Box, Container, Grid, Typography, Paper, SvgIcon } from '@mui/material';
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk';
import { type ComponentType, type ReactElement, type ReactNode } from 'react';

import SafeTxProvider from '../../SafeTxProvider';

import css from './styles.module.css';

const TxLayoutHeader = ({
  icon,
  subtitle,
}: {
  hideNonce: TxLayoutProps['hideNonce'];
  icon: TxLayoutProps['icon'];
  subtitle: TxLayoutProps['subtitle'];
}): ReactElement => {
  if (!icon && !subtitle) return <></>;

  return (
    <Box className={css.headerInner}>
      <Box display="flex" alignItems="center">
        {icon && (
          <div className={css.icon}>
            <SvgIcon component={icon} inheritViewBox />
          </div>
        )}

        <Typography variant="h4" component="div" fontWeight="bold">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

type TxLayoutProps = {
  title: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
  icon?: ComponentType;
  step?: number;
  txSummary?: TransactionSummary;
  onBack?: () => void;
  hideNonce?: boolean;
  hideProgress?: boolean;
  isBatch?: boolean;
  isReplacement?: boolean;
  isMessage?: boolean;
  isRecovery?: boolean;
};

const TxLayout = ({
  title,
  subtitle,
  icon,
  children,
  hideNonce = false,
}: TxLayoutProps): ReactElement => {
  return (
    <SafeTxProvider>
      <>
        <Container className={css.container}>
          <Grid container gap={3} justifyContent="center">
            {/* Main content */}
            <Grid item xs={12} md={7}>
              <div className={css.titleWrapper}>
                <Typography
                  data-testid="modal-title"
                  variant="h3"
                  component="div"
                  fontWeight="700"
                  className={css.title}
                >
                  {title}
                </Typography>
              </div>

              <Paper data-testid="modal-header" className={css.header}>
                <TxLayoutHeader subtitle={subtitle} icon={icon} hideNonce={hideNonce} />
              </Paper>

              <div className={css.step}>{children}</div>
            </Grid>
          </Grid>
        </Container>
      </>
    </SafeTxProvider>
  );
};

export default TxLayout;
