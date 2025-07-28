import { Box, Typography, Divider, Button } from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';

import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
import { encodeRedeem } from '@/utils/erisEvm';

import { TxModalContext } from '../..';

export interface RedeemFlowProps {
  canRedeem: boolean;
}

const RedeemFlow = ({ canRedeem }: RedeemFlowProps): React.ReactElement => {
  const { sdk } = useSafeAppsSDK();
  const { setTxFlow } = useContext(TxModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const txData = encodeRedeem();
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
          <Typography variant="h4" fontWeight={700}>
            Redeem Unstaked Tokens
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Redeem any stNIBI that has finished unstaking to receive NIBI principal and accrued
            rewards. NIBI received will be converted to WNIBI.
          </Typography>
        </Box>

        {!canRedeem && (
          <Box my={3}>
            <Typography variant="body2" color="warning.main">
              No tokens are currently available for redemption. You need to unstake tokens and wait
              for the unstaking period to complete.
            </Typography>
          </Box>
        )}

        <Divider />

        <Box my={3}>
          <Button
            disabled={!canRedeem || isSubmitting}
            variant="contained"
            onClick={onSubmit}
            fullWidth
          >
            {isSubmitting ? 'Processing...' : 'Redeem'}
          </Button>
        </Box>
      </TxCard>
    </TxLayout>
  );
};

export default RedeemFlow;
