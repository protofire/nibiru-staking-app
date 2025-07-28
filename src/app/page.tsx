'use client';

import { Typography, Box, Button, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { useContext, ReactElement } from 'react';

import TokenIcon from '@/components/common/TokenIcon';
import { TxModalContext } from '@/components/tx-flow';
import LiquidStakeFlow from '@/components/tx-flow/flows/LiquidStake';
import RedeemFlow from '@/components/tx-flow/flows/Redeem';
import UnstakeFlow from '@/components/tx-flow/flows/Unstake';
import useLoadErisEvm from '@/hooks/useLoadErisEvm';
import { safeFormatUnits } from '@/utils/formatters';

export default function Home(): ReactElement {
  const { data: erisData, isLoading: loading } = useLoadErisEvm();
  const { setTxFlow } = useContext(TxModalContext);

  const onLiquidStakeClick = (): void => {
    if (erisData) {
      setTxFlow(<LiquidStakeFlow nibiBalance={erisData.nibiBalance} />);
    }
  };

  const onUnstakeClick = (): void => {
    if (erisData) {
      setTxFlow(<UnstakeFlow stNibiBalance={erisData.stNibiBalance} />);
    }
  };

  const onRedeemClick = (): void => {
    if (erisData) {
      setTxFlow(<RedeemFlow canRedeem={erisData.canRedeem} />);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h3" component="h1" gutterBottom>
        Eris Liquid Staking
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Stake your NIBI tokens to earn rewards while maintaining liquidity with stNIBI tokens.
      </Typography>

      <Grid container spacing={3} mt={2}>
        {/* NIBI Balance Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TokenIcon
                  logoUri="/0x4300000000000000000000000000000000000002.png"
                  tokenSymbol="NIBI"
                />
                <Typography variant="h6" ml={2}>
                  NIBI Balance
                </Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {safeFormatUnits(erisData?.nibiBalance || '0', 18)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Available for liquid staking
              </Typography>
              <Button
                variant="contained"
                onClick={onLiquidStakeClick}
                disabled={!erisData?.nibiBalance || erisData.nibiBalance === '0'}
                fullWidth
              >
                Liquid Stake
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* stNIBI Balance Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TokenIcon logoUri="/proto-logo.svg" tokenSymbol="stNIBI" />
                <Typography variant="h6" ml={2}>
                  stNIBI Balance
                </Typography>
              </Box>
              <Typography variant="h4" gutterBottom>
                {safeFormatUnits(erisData?.stNibiBalance || '0', 18)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Liquid staked NIBI tokens
              </Typography>
              <Button
                variant="outlined"
                onClick={onUnstakeClick}
                disabled={!erisData?.stNibiBalance || erisData.stNibiBalance === '0'}
                fullWidth
              >
                Unstake
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Redeem Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Redeem Tokens
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Redeem unstaked tokens to receive NIBI + rewards
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={onRedeemClick}
                disabled={!erisData?.canRedeem}
                fullWidth
                sx={{ mt: 2 }}
              >
                {erisData?.canRedeem ? 'Redeem Available' : 'No Tokens to Redeem'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Information Section */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          How Liquid Staking Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              1. Liquid Stake
            </Typography>
            <Typography variant="body2">
              Deposit NIBI to mint stNIBI. Your stNIBI represents your staked NIBI plus any accrued
              rewards.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              2. Unstake
            </Typography>
            <Typography variant="body2">
              Queue your stNIBI for unstaking. There may be an unstaking period before you can
              redeem.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              3. Redeem
            </Typography>
            <Typography variant="body2">
              Once the unstaking period is complete, redeem your tokens to receive NIBI + rewards as
              WNIBI.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
