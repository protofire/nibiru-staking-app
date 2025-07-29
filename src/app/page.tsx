'use client';

import { TrendingUp, AccountBalance, Redeem as RedeemIcon } from '@mui/icons-material';
import { Typography, Box, Button, Card, CardContent, Grid, Container, Stack } from '@mui/material';
import { useContext, ReactElement } from 'react';

import TokenIcon from '@/components/common/TokenIcon';
import { TxModalContext } from '@/components/tx-flow';
import RedeemFlow from '@/components/tx-flow/flows/Redeem';
import StakeFlow from '@/components/tx-flow/flows/Stake';
import UnstakeFlow from '@/components/tx-flow/flows/Unstake';
import { useLoadNibiruEvm } from '@/hooks/useLoadNibiruEvm';
import { safeFormatUnits } from '@/utils/formatters';

export default function Home(): ReactElement {
  const { data: nibiruData } = useLoadNibiruEvm();
  const { setTxFlow } = useContext(TxModalContext);

  const onStakeClick = (): void => {
    if (nibiruData) {
      setTxFlow(<StakeFlow nibiBalance={nibiruData.nibiBalance} />);
    }
  };

  const onUnstakeClick = (): void => {
    if (nibiruData) {
      setTxFlow(<UnstakeFlow stNibiBalance={nibiruData.stNibiBalance} />);
    }
  };

  const onRedeemClick = (): void => {
    if (nibiruData) {
      setTxFlow(<RedeemFlow canRedeem={nibiruData.canRedeem} />);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #12ff80 0%, #0cb259 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Nibiru Liquid Staking
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
          >
            Stake your NIBI tokens to earn rewards while maintaining liquidity with stNIBI tokens.
          </Typography>
        </Box>

        {/* Staking Cards */}
        <Grid container spacing={4} mb={6}>
          {/* NIBI Balance Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background:
                  'linear-gradient(135deg, rgba(18, 255, 128, 0.1) 0%, rgba(12, 178, 89, 0.05) 100%)',
                border: '1px solid rgba(18, 255, 128, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(18, 255, 128, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #12ff80 0%, #0cb259 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TokenIcon logoUri="/logo192.png" tokenSymbol="NIBI" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      NIBI Balance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available for staking
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{ mb: 3, color: 'var(--color-primary-main)' }}
                >
                  {safeFormatUnits(nibiruData?.nibiBalance || '0', 18, true)}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  variant="contained"
                  onClick={onStakeClick}
                  disabled={!nibiruData?.nibiBalance || nibiruData.nibiBalance === '0'}
                  fullWidth
                  size="large"
                  startIcon={<TrendingUp />}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #12ff80 0%, #0cb259 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0cb259 0%, #12ff80 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(99, 102, 105, 0.3)',
                    },
                  }}
                >
                  Stake NIBI
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* stNIBI Balance Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background:
                  'linear-gradient(135deg, rgba(99, 102, 105, 0.1) 0%, rgba(48, 48, 51, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 105, 0.3)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(99, 102, 105, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #636669 0%, #303033 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TokenIcon logoUri="/proto-logo.svg" tokenSymbol="stNIBI" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      stNIBI Balance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Staked NIBI tokens
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="h3" fontWeight="bold" sx={{ mb: 3, color: '#ffffff' }}>
                  {safeFormatUnits(nibiruData?.stNibiBalance || '0', 18, true)}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  variant="outlined"
                  onClick={onUnstakeClick}
                  disabled={!nibiruData?.stNibiBalance || nibiruData.stNibiBalance === '0'}
                  fullWidth
                  size="large"
                  startIcon={<AccountBalance />}
                  sx={{
                    py: 1.5,
                    borderColor: '#636669',
                    color: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(99, 102, 105, 0.3)',
                      color: 'rgba(99, 102, 105, 0.5)',
                    },
                  }}
                >
                  Unstake
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Redeem Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                background:
                  'linear-gradient(135deg, rgba(0, 180, 96, 0.1) 0%, rgba(2, 141, 76, 0.05) 100%)',
                border: '1px solid rgba(0, 180, 96, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(0, 180, 96, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #00b460 0%, #028d4c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RedeemIcon sx={{ color: 'white', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Redeem Tokens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Claim NIBI + rewards
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    minHeight: '72px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Redeem unstaked tokens to receive NIBI + rewards as WNIBI
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  variant="contained"
                  color="success"
                  onClick={onRedeemClick}
                  disabled={!nibiruData?.canRedeem}
                  fullWidth
                  size="large"
                  startIcon={<RedeemIcon />}
                  sx={{
                    py: 1.5,
                    background: nibiruData?.canRedeem
                      ? 'linear-gradient(135deg, #00b460 0%, #028d4c 100%)'
                      : 'rgba(99, 102, 105, 0.3)',
                    '&:hover': {
                      background: nibiruData?.canRedeem
                        ? 'linear-gradient(135deg, #028d4c 0%, #00b460 100%)'
                        : 'rgba(99, 102, 105, 0.3)',
                    },
                  }}
                >
                  {nibiruData?.canRedeem ? 'Redeem Available' : 'No Tokens to Redeem'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
