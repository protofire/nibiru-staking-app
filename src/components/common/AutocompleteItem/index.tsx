import { Grid, Typography } from '@mui/material';
import { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk';
import { ReactElement } from 'react';

import { formatVisualAmount } from '@/utils/formatters';

import TokenIcon from '../TokenIcon';

export const AutocompleteItem = (item: {
  tokenInfo: TokenInfo;
  claimableField: string;
}): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatVisualAmount(item.claimableField, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
);
