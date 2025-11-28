'use client';

import { TrendingUp, AccountBalance, Redeem as RedeemIcon } from '@mui/icons-material';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
  Stack,
  LinearProgress,
} from '@mui/material';
import { NibiruQuerier, Testnet, Mainnet } from '@nibiruchain/nibijs';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import converter from 'bech32-converting';
import { useContext, ReactElement, useEffect, useState, useMemo } from 'react';

import TokenIcon from '@/components/common/TokenIcon';
import { TxModalContext } from '@/components/tx-flow';
import RedeemFlow from '@/components/tx-flow/flows/Redeem';
import StakeFlow from '@/components/tx-flow/flows/Stake';
import UnstakeFlow from '@/components/tx-flow/flows/Unstake';
import { STNIBI_DECIMALS, MAINNET_CHAIN_ID, NIBIRU_ERIS_ADDRESSES } from '@/config/nibiruEvm';
import { useLoadNibiruEvm } from '@/hooks/useLoadNibiruEvm';
import { safeFormatUnits } from '@/utils/formatters';

interface UnbondRequest {
  id: number;
  shares: string;
  state: string;
  batch: {
    id: number;
    reconciled: boolean;
    total_shares: string;
    utoken_unclaimed: string;
    est_unbond_end_time: number;
  } | null;
  pending: {
    id: number;
    ustake_to_burn: string;
    est_unbond_start_time: number;
  } | null;
}

export default function Home(): ReactElement {
  const { data: nibiruData } = useLoadNibiruEvm();
  const { setTxFlow } = useContext(TxModalContext);
  const { safe } = useSafeAppsSDK();
  const [unbondRequests, setUnbondRequests] = useState<UnbondRequest[]>([]);
  const [querier, setQuerier] = useState<NibiruQuerier | null>(null);

  useEffect(() => {
    let isMounted = true;
    const connectQuerier = async (): Promise<void> => {
      if (!safe?.chainId) {
        setQuerier(null);
        return;
      }
      const network = safe.chainId === MAINNET_CHAIN_ID ? Mainnet() : Testnet(2);
      const q = await NibiruQuerier.connect(network.endptTm);
      if (isMounted) setQuerier(q);
    };
    connectQuerier();
    return () => {
      isMounted = false;
    };
  }, [safe?.chainId]);

  useEffect(() => {
    if (!querier || !safe?.chainId || !safe?.safeAddress) return;

    const fetchUnbondRequests = async (): Promise<void> => {
      try {
        const result = await querier.wasmClient.queryContractSmart(
          NIBIRU_ERIS_ADDRESSES[safe?.chainId as keyof typeof NIBIRU_ERIS_ADDRESSES],
          {
            unbond_requests_by_user_details: { user: converter('nibi').toBech32(safe.safeAddress) },
          }
        );
        if (Array.isArray(result)) {
          setUnbondRequests(result as UnbondRequest[]);
        }
      } catch (error) {
        console.error('Error fetching unbond requests:', error);
      }
    };

    void fetchUnbondRequests();
    const intervalId = setInterval(() => {
      void fetchUnbondRequests();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [querier, safe?.chainId, safe?.safeAddress]);

  const isUnstakeDisabled = useMemo((): boolean => {
    if (!nibiruData?.stNibiBalance) return true;
    if (nibiruData.stNibiBalance === '0') return true;
    if (nibiruData.stNibiBalance === '0x') return true;
    if (nibiruData.stNibiBalance.trim() === '') return true;

    const balance = BigInt(nibiruData.stNibiBalance);
    return !(balance > BigInt(0));
  }, [nibiruData]);

  const isRedeemDisabled = useMemo((): boolean => {
    if (unbondRequests.length === 0) return true;
    // Check if any request is claimable.
    // Assuming 'CLAIMABLE' state or if unbond time has passed.
    // Based on user request: "disable redeem if there are no anything"
    // If we strictly follow "no anything", then length === 0 is enough.
    // However, usually redeem is only for finished unbonding.
    // Let's check if any request has finished unbonding.
    const nowSec = Math.floor(Date.now() / 1000);
    const hasClaimable = unbondRequests.some((req) => {
      if (req.batch) {
        return req.batch.est_unbond_end_time <= nowSec;
      }
      return false;
    });
    return !hasClaimable;
  }, [unbondRequests]);

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
      {/* {nibiruData?.state && (
        <Box mb={4}>
          <Typography variant="h6" color="white" fontWeight="bold">
            <pre>{JSON.stringify(nibiruData.state, null, 2)}</pre>
          </Typography>
        </Box>
      )} */}

      <Box py={4}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
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
                  'linear-gradient(135deg, rgba(29, 233, 182, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)',
                border: '1px solid rgba(29, 233, 182, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(29, 233, 182, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
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
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1de9b6 0%, #0ea5e9 100%)',
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
                  {safeFormatUnits(nibiruData?.stNibiBalance || '0', STNIBI_DECIMALS, true)}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                <Button
                  variant="outlined"
                  onClick={onUnstakeClick}
                  disabled={isUnstakeDisabled}
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
                  'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 40px rgba(14, 165, 233, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
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
                  disabled={isRedeemDisabled}
                  fullWidth
                  size="large"
                  startIcon={<RedeemIcon />}
                  sx={{
                    py: 1.5,
                    background:
                      nibiruData?.stNibiBalance && nibiruData.stNibiBalance !== '0'
                        ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
                        : 'rgba(99, 102, 105, 0.3)',
                    '&:hover': {
                      background:
                        nibiruData?.stNibiBalance && nibiruData.stNibiBalance !== '0'
                          ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                          : 'rgba(99, 102, 105, 0.3)',
                    },
                  }}
                >
                  {nibiruData?.stNibiBalance && nibiruData.stNibiBalance !== '0'
                    ? 'Redeem Available'
                    : 'No Tokens to Redeem'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Unstake Queue Summary (from unbondRequests) */}
        {unbondRequests.length > 0 && (
          <Box mt={2}>
            <Card
              sx={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.04)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Unstake Queue
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {unbondRequests.length} entries
                </Typography>

                <Stack spacing={1}>
                  {unbondRequests.map((req) => {
                    const amount = req.shares; // Assuming shares is the amount
                    // Determine timestamps
                    let start = 0;
                    let end = 0;
                    if (req.batch) {
                      // If in batch, it's unbonding.
                      // We don't have explicit start time in batch from the JSON example,
                      // but we have est_unbond_end_time.
                      // We can try to infer start or just show progress if we had start.
                      // If we don't have start, maybe just show "Unbonding..."
                      end = req.batch.est_unbond_end_time * 1000;
                      // If we don't have start, we can't show accurate progress bar relative to start.
                      // But maybe we can assume 21 days unbonding period?
                      // Or just show time remaining.
                      start = end - 21 * 24 * 60 * 60 * 1000; // Approximate start
                    } else if (req.pending) {
                      // Pending
                      start = Date.now(); // It's pending now
                      end = req.pending.est_unbond_start_time * 1000;
                    }

                    const now = Date.now();
                    let pct = 0;
                    if (end > start) {
                      pct = ((now - start) / (end - start)) * 100;
                      if (pct < 0) pct = 0;
                      if (pct > 100) pct = 100;
                    }

                    return (
                      <Box
                        key={req.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          background: 'rgba(255,255,255,0.01)',
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                              {req.state} — {safeFormatUnits(amount, STNIBI_DECIMALS, true)} stNIBI
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {req.id}
                            </Typography>
                          </Box>

                          {req.batch && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Unlocks:{' '}
                              {new Date(req.batch.est_unbond_end_time * 1000).toLocaleString()}
                            </Typography>
                          )}
                          {req.pending && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Est. Start:{' '}
                              {new Date(req.pending.est_unbond_start_time * 1000).toLocaleString()}
                            </Typography>
                          )}

                          {/* Progress line */}
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: 'rgba(255,255,255,0.04)',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {req.state === 'PENDING'
                                ? 'Waiting to start unbonding'
                                : `${pct.toFixed(0)}% to unlock`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}
