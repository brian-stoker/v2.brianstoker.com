import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import Head from 'src/modules/components/Head';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import BrandingCssVarsProvider from '@stoked-ui/docs';
import Section from 'src/layouts/Section';
import {pageToTitleI18n} from 'src/modules/utils/helpers';
import {useTranslate} from '@stoked-ui/docs/i18n';
import {Link} from '@stoked-ui/docs/Link';
import type {MuiPage} from 'src/MuiPage';
import materialPages from '../data/pages';
import Alert from '@mui/material/Alert';
import {useRouter} from 'next/router';
import {useSearchParams} from 'next/navigation';

export default function SubscriptionPage() {
  const t = useTranslate();
  const pages = materialPages;
  const componentPageData = pages.find(({ title }) => title === 'Components');
  function renderItem(aPage: MuiPage) {
    return (
      <ListItem key={aPage.pathname} disablePadding>
        <ListItemButton
          component={Link}
          noLinkStyle
          href={aPage.pathname}
          sx={{
            px: 1,
            py: 0.5,
            fontSize: '0.84375rem',
            fontWeight: 500,
            '&:hover, &:focus': { '& svg': { opacity: 1 } },
          }}
        >
          {pageToTitleI18n(aPage, t) || ''}
          <KeyboardArrowRightRounded
            sx={{
              ml: 'auto',
              fontSize: '1.125rem',
              opacity: 0,
              color: 'primary.main',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  }
  // Store status code and message in state, not React elements
  const [alertStatus, setAlertStatus] = React.useState<{
    severity: 'error' | 'success';
    message: string;
  } | null>(null);

  const router = useRouter();
  const query = useSearchParams();
  const code = query.get('code');
  const token = query.get('token');
  const email = query.get('email') || '';

  React.useEffect(() => {
    // 402: 'DB_NAME not available'
    // 401: 'Invalid token or Email'
    // 404: 'Email not found'
    // 201: 'Email already verified'
    // 200: 'Email verified'
    // 401: 'Invalid token'
    // 500: 'Error'

    const getStatusInfo = (statusCode: string) => {
      switch (statusCode) {
        case '402':
          return {
            severity: 'error' as const,
            message: 'System error occurred staff has been notified.'
          };
        case '401':
          return {
            severity: 'error' as const,
            message: 'Invalid token or Email'
          };
        case '404':
          return {
            severity: 'error' as const,
            message: `Email not found: ${email}`
          };
        case '201':
          return {
            severity: 'success' as const,
            message: `Email already verified: ${email}`
          };
        case '200':
          return {
            severity: 'success' as const,
            message: `Email verified: ${email}`
          };
        case '500':
        default:
          return {
            severity: 'error' as const,
            message: 'System error occurred staff has been notified.'
          };
      }
    }
    
    if (!code) {
      router.push('/404');
      return;
    }
    
    setAlertStatus(getStatusInfo(code));
  }, [code, email, router]);

  const handleSubscribe = async () => {
    // ... existing code logic ...
    router.push('/'); // Instead of redirect
  };

  return (
    <BrandingCssVarsProvider>
      <Head
        title="Subscription - SUI"
        description="Email Verification."
      />
      <AppHeader />
      <main id="main-content">
        <Section bg="gradient" sx={{ py: { xs: 2, sm: 4 } }}>
          <Typography component="h1" variant="h2" sx={{ mb: 4, pl: 1 }}>
            Subscription
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {alertStatus && (
              <Alert
                severity={alertStatus.severity}
                sx={{
                  fontWeight: 'medium',
                  bgcolor: `${alertStatus.severity}.50`,
                  border: '1px solid',
                  borderColor: `${alertStatus.severity}.200`,
                  color: `${alertStatus.severity}.900`,
                  display: 'flex',
                  width: '100%'
                }}
              >
                {alertStatus.message}
              </Alert>
            )}
          </Box>
        </Section>
      </main>
      <Divider />
      <AppFooter />
    </BrandingCssVarsProvider>
  );
}
