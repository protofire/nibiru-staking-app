import { Redeem as RedeemIcon, Info } from '@mui/icons-material';
import {
  Box,
  Typography,
  Divider,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';

import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
import { STNIBI_DECIMALS } from '@/config/nibiruEvm';
import { safeFormatUnits } from '@/utils/formatters';
import { encodeRedeem } from '@/utils/nibiruEvm';

import { TxModalContext } from '../..';

export interface RedeemFlowProps {
  canRedeem: boolean;
  stNibiBalance?: string;
}

const RedeemFlow = ({ canRedeem, stNibiBalance }: RedeemFlowProps): React.ReactElement => {
  const { sdk, safe } = useSafeAppsSDK();
  const { setTxFlow } = useContext(TxModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (): Promise<void> => {
    if (!canRedeem) {
      return;
    }

    setIsSubmitting(true);
    try {
      const txData = encodeRedeem(safe.chainId);
      await sdk.txs.send({ txs: [txData] });
      setTxFlow(undefined);
    } catch (error) {
      console.error('Redeem transaction failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TxLayout title="Redeem Unstaked Tokens">
      <TxCard>
        <Box my={3}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RedeemIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Redeem Tokens
              </Typography>
              <Chip
                label="Claim NIBI + rewards as WNIBI"
                size="small"
                sx={{
                  mt: 0.5,
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: 'var(--color-info-main)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              />
            </Box>
          </Stack>

          <Alert
            severity="info"
            icon={<Info />}
            sx={{
              mb: 3,
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              '& .MuiAlert-icon': {
                color: 'var(--color-info-main)',
              },
            }}
          >
            Redeem any stNIBI that has finished unstaking to receive NIBI principal and accrued
            rewards. NIBI received will be converted to WNIBI.
          </Alert>
        </Box>

        {stNibiBalance && canRedeem && (
          <Box my={3}>
            <Typography variant="body1" fontWeight="bold" mb={1}>
              Available to Redeem:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {safeFormatUnits(stNibiBalance, STNIBI_DECIMALS, true)} stNIBI
            </Typography>
          </Box>
        )}

        {!canRedeem && (
          <Box my={3}>
            <Alert severity="warning">
              <Typography variant="body2">
                No tokens are currently available for redemption. You need to have stNIBI tokens to
                redeem. Please stake NIBI first to obtain stNIBI tokens.
              </Typography>
            </Alert>
          </Box>
        )}

        <Divider sx={{ background: 'rgba(99, 102, 105, 0.2)' }} />

        <Box my={3}>
          <Button
            disabled={!canRedeem || isSubmitting}
            variant="contained"
            onClick={onSubmit}
            fullWidth
            size="large"
            startIcon={isSubmitting ? <LinearProgress /> : <RedeemIcon />}
            sx={{
              py: 1.5,
              background: canRedeem
                ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                : 'rgba(99, 102, 105, 0.3)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              '&:hover': {
                background: canRedeem
                  ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                  : 'rgba(99, 102, 105, 0.3)',
                transform: canRedeem ? 'translateY(-2px)' : 'none',
                boxShadow: canRedeem ? '0 10px 30px rgba(14, 165, 233, 0.3)' : 'none',
              },
              '&:disabled': {
                background: 'rgba(99, 102, 105, 0.3)',
                color: 'rgba(255, 255, 255, 0.5)',
                transform: 'none',
                boxShadow: 'none',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting
              ? 'Processing Transaction...'
              : canRedeem
                ? 'Redeem All stNIBI'
                : 'No Tokens to Redeem'}
          </Button>
        </Box>
      </TxCard>
    </TxLayout>
  );
};

export default RedeemFlow;
