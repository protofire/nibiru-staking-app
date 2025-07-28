import { Box, Typography, Divider, Button, InputAdornment } from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';

import NumberField from '@/components/common/NumberField';
import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
import { MIN_STAKE_AMOUNT, toMicroNibi } from '@/config/erisEvm';
import { encodeLiquidStake } from '@/utils/erisEvm';
import { safeFormatUnits } from '@/utils/formatters';
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation';

import { TxModalContext } from '../..';

interface LiquidStakeFormData {
  amount: string;
}

export interface LiquidStakeFlowProps {
  nibiBalance: string;
}

const LiquidStakeFlow = ({ nibiBalance }: LiquidStakeFlowProps): React.ReactElement => {
  const { sdk } = useSafeAppsSDK();
  const { setTxFlow } = useContext(TxModalContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LiquidStakeFormData>({
    defaultValues: {
      amount: '',
    },
  });

  const amount = watch('amount');
  const maxAmount = nibiBalance;

  const validateAmount = (value: string): string | true => {
    const numValue = Number(value);

    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }

    // Check minimum stake amount (1 microNIBI)
    const microNibiAmount = toMicroNibi(numValue);
    if (microNibiAmount < MIN_STAKE_AMOUNT) {
      return 'Minimum stake amount is 1 microNIBI (0.000001 NIBI)';
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

  const onSubmit = async (data: LiquidStakeFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const txData = encodeLiquidStake(data.amount);
      await sdk.txs.send({ txs: [txData] });
      setTxFlow(undefined);
    } catch (error) {
      console.error('Liquid stake transaction failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TxLayout title="Liquid Stake NIBI">
      <TxCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box my={3}>
            <Typography variant="h4" fontWeight={700}>
              Liquid Stake NIBI
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Deposit NIBI to liquid stake and mint stNIBI. Your stNIBI represents your staked NIBI
              plus accrued rewards.
            </Typography>
          </Box>

          <Box my={3}>
            <NumberField
              label="Amount to Stake"
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button size="small" onClick={onMaxAmountClick}>
                      Max
                    </Button>
                    <Typography variant="body2" sx={{ ml: 1 }}>
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
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Available: {safeFormatUnits(maxAmount, 18)} NIBI
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
              {isSubmitting ? 'Processing...' : 'Liquid Stake'}
            </Button>
          </Box>
        </form>
      </TxCard>
    </TxLayout>
  );
};

export default LiquidStakeFlow;
