import { Box, Typography, Divider, Button, InputAdornment } from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { parseUnits } from 'viem';

import NumberField from '@/components/common/NumberField';
import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
import { MIN_STAKE_AMOUNT, STNIBI_DECIMALS } from '@/config/nibiruEvm';
import { safeFormatUnits } from '@/utils/formatters';
import { encodeUnstake } from '@/utils/nibiruEvm';
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation';

import { TxModalContext } from '../..';

interface UnstakeFormData {
  amount: string;
}

export interface UnstakeFlowProps {
  stNibiBalance: string;
}

const UnstakeFlow = ({ stNibiBalance }: UnstakeFlowProps): React.ReactElement => {
  const { sdk, safe } = useSafeAppsSDK();
  const { setTxFlow } = useContext(TxModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnstakeFormData>({
    defaultValues: {
      amount: '',
    },
  });

  const amount = watch('amount');
  const maxAmount = stNibiBalance;

  const validateAmount = (value: string): string | true => {
    if (!value || Number(value) <= 0) {
      return 'Amount must be greater than 0';
    }

    try {
      const amountInBaseUnits = parseUnits(value, STNIBI_DECIMALS);
      const minStakeInStNibiDecimals = BigInt(MIN_STAKE_AMOUNT) / BigInt(1e12); // Convert from 18-decimal to 6-decimal

      if (amountInBaseUnits < minStakeInStNibiDecimals) {
        return `Minimum unstake amount is 1 microNIBI (0.000001 NIBI)`;
      }

      if (amountInBaseUnits % minStakeInStNibiDecimals !== BigInt(0)) {
        return `Amount must be in multiples of 1 microNIBI (0.000001 NIBI)`;
      }
    } catch {
      return 'Invalid amount';
    }

    const limitValidation = validateLimitedAmount(value, STNIBI_DECIMALS, maxAmount);
    if (typeof limitValidation === 'string') {
      return limitValidation;
    }

    const decimalValidation = validateDecimalLength(value, STNIBI_DECIMALS);
    if (typeof decimalValidation === 'string') {
      return decimalValidation;
    }

    return true;
  };

  const onMaxAmountClick = (): void => {
    setValue('amount', safeFormatUnits(maxAmount, STNIBI_DECIMALS), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: UnstakeFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const txData = encodeUnstake(data.amount, safe.chainId);
      await sdk.txs.send({ txs: [txData] });
      setTxFlow(undefined);
    } catch (error) {
      console.error('Unstake transaction failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TxLayout title="Unstake stNIBI">
      <TxCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box my={3}>
            <Typography variant="h4" fontWeight={700}>
              Unstake stNIBI
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Queue stNIBI to unstake and later redeem it for NIBI principal plus accrued rewards.
            </Typography>
          </Box>

          <Box my={3}>
            <NumberField
              label="Amount to Unstake"
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button size="small" onClick={onMaxAmountClick}>
                      Max
                    </Button>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      stNIBI
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
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Available: {safeFormatUnits(maxAmount, STNIBI_DECIMALS)} stNIBI
            </Typography>
          </Box>

          <Divider />

          <Box my={3}>
            <Button
              disabled={!amount || !!errors.amount || isSubmitting}
              variant="contained"
              type="submit"
              fullWidth
            >
              {isSubmitting ? 'Processing...' : 'Unstake'}
            </Button>
          </Box>
        </form>
      </TxCard>
    </TxLayout>
  );
};

export default UnstakeFlow;
