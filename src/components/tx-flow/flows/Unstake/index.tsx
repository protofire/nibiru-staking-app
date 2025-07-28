import { Box, Typography, Divider, Button, InputAdornment } from '@mui/material';
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';

import NumberField from '@/components/common/NumberField';
import TxCard from '@/components/common/TxCard';
import TxLayout from '@/components/tx-flow/common/TxLayout';
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
  const { sdk } = useSafeAppsSDK();
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
    const numValue = Number(value);

    if (numValue <= 0) {
      return 'Amount must be greater than 0';
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

  const onSubmit = async (data: UnstakeFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      const txData = encodeUnstake(data.amount);
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
              Available: {safeFormatUnits(maxAmount, 18)} stNIBI
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
