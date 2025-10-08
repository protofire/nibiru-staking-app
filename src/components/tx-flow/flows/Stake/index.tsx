import { TrendingUp, Info } from '@mui/icons-material';
import {
  Box,
  Typography,
  Divider,
  Button,
  InputAdornment,
  Chip,
  Stack,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { parseUnits } from 'viem';

import NumberField from '@/components/common/NumberField';
import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
import { MIN_STAKE_AMOUNT } from '@/config/nibiruEvm';
import { safeFormatUnits } from '@/utils/formatters';
import { encodeStake } from '@/utils/nibiruEvm';
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation';

import { TxModalContext } from '../..';

interface StakeFormData {
  amount: string;
}

export interface StakeFlowProps {
  nibiBalance: string;
}

const StakeFlow = ({ nibiBalance }: StakeFlowProps): React.ReactElement => {
  const { safe, sdk } = useSafeAppsSDK();
  const { setTxFlow } = useContext(TxModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StakeFormData>({
    defaultValues: {
      amount: '',
    },
  });

  const amount = watch('amount');
  const maxAmount = nibiBalance;

  const validateAmount = (value: string): string | true => {
    if (!value || Number(value) <= 0) {
      return 'Amount must be greater than 0';
    }

    try {
      const amountInBaseUnits = parseUnits(value, 18);
      const minStake = BigInt(MIN_STAKE_AMOUNT);

      if (amountInBaseUnits < minStake) {
        return 'Minimum stake amount is 1 microNIBI (0.000001 NIBI)';
      }

      if (amountInBaseUnits % minStake !== BigInt(0)) {
        return 'Amount must be in multiples of 1 microNIBI (0.000001 NIBI)';
      }
    } catch {
      // parseUnits throws if the value is not a valid number/decimal string
      return 'Invalid amount';
    }

    const limitValidation = validateLimitedAmount(value, 18, maxAmount);
    if (typeof limitValidation === 'string') {
      return limitValidation;
    }

    const decimalValidation = validateDecimalLength(value, 18);
    if (typeof decimalValidation === 'string') {
      return decimalValidation;
    }

    return true;
  };

  const onMaxAmountClick = (): void => {
    setValue('amount', safeFormatUnits(maxAmount, 18), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: StakeFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const txData = encodeStake(data.amount, safe.chainId);
      await sdk.txs.send({ txs: [txData] });
      setTxFlow(undefined);
    } catch (error) {
      console.error('Stake transaction failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TxLayout title="Stake NIBI">
      <TxCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box my={3}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
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
                <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Stake NIBI
                </Typography>
                <Chip
                  label="Earn rewards while maintaining liquidity"
                  size="small"
                  sx={{
                    mt: 0.5,
                    background: 'rgba(29, 233, 182, 0.1)',
                    color: 'var(--color-primary-main)',
                    border: '1px solid rgba(29, 233, 182, 0.3)',
                  }}
                />
              </Box>
            </Stack>

            <Alert
              severity="info"
              icon={<Info />}
              sx={{
                mb: 3,
                background: 'rgba(29, 233, 182, 0.1)',
                border: '1px solid rgba(29, 233, 182, 0.3)',
                '& .MuiAlert-icon': {
                  color: 'var(--color-info-main)',
                },
              }}
            >
              Your stNIBI represents your staked NIBI plus accrued rewards. You can unstake at any
              time.
            </Alert>
          </Box>

          <Box my={3}>
            <NumberField
              label="Amount to Stake"
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={onMaxAmountClick}
                      sx={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1de9b6 0%, #0ea5e9 100%)',
                        },
                      }}
                    >
                      Max
                    </Button>
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                      NIBI
                    </Typography>
                  </InputAdornment>
                ),
              }}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register('amount', {
                required: 'Amount is required',
                validate: validateAmount,
              })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(28, 28, 28, 0.5)',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-primary-main)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-primary-main)',
                    borderWidth: '2px',
                  },
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="body2" color="text.secondary">
                Available: {safeFormatUnits(maxAmount, 18)} NIBI
              </Typography>
              {amount && Number(amount) > 0 && (
                <Chip
                  label={`≈ ${amount} stNIBI`}
                  size="small"
                  sx={{
                    background: 'rgba(29, 233, 182, 0.1)',
                    color: 'var(--color-primary-main)',
                    border: '1px solid rgba(29, 233, 182, 0.3)',
                  }}
                />
              )}
            </Stack>
          </Box>

          <Divider sx={{ background: 'rgba(99, 102, 105, 0.2)' }} />

          <Box my={3}>
            <Button
              disabled={!amount || !!errors.amount || isSubmitting}
              variant="contained"
              type="submit"
              fullWidth
              size="large"
              startIcon={isSubmitting ? <LinearProgress /> : <TrendingUp />}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #1de9b6 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1de9b6 0%, #0ea5e9 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(29, 233, 182, 0.3)',
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
              {isSubmitting ? 'Processing Transaction...' : `Stake ${amount || '0'} NIBI`}
            </Button>
          </Box>
        </form>
      </TxCard>
    </TxLayout>
  );
};

export default StakeFlow;
