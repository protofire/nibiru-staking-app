import { Card, CardContent } from '@mui/material';
import type { ReactElement, ReactNode } from 'react';

import css from './styles.module.css';

const sx = { my: 2, border: 0 };

const TxCard = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <Card sx={sx}>
      <CardContent className={css.cardContent}>{children}</CardContent>
    </Card>
  );
};

export default TxCard;
