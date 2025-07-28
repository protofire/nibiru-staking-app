'use client';

import './globals.css';

import CircularProgress from '@mui/material/CircularProgress';
import { Theme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { SafeProvider } from '@safe-global/safe-apps-react-sdk';
import { SafeThemeProvider, useThemeMode } from '@safe-global/safe-react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';

import { TxModalProvider } from '@/components/tx-flow';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  const { themeMode } = useThemeMode('dark');
  return (
    <html lang="en">
      <SafeThemeProvider mode={themeMode}>
        {(safeTheme: Theme) => (
          <ThemeProvider theme={safeTheme}>
            <body className={inter.className + 'p-4 m-4 h-full bg-[rgb(28,28,28)]'}>
              <QueryClientProvider client={queryClient}>
                <SafeProvider
                  loader={
                    <>
                      <Typography variant="h1">Waiting for Safe...</Typography>
                      <CircularProgress color="primary" />
                    </>
                  }
                >
                  <TxModalProvider>{children}</TxModalProvider>
                </SafeProvider>
              </QueryClientProvider>
            </body>
          </ThemeProvider>
        )}
      </SafeThemeProvider>
    </html>
  );
}
