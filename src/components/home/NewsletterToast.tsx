import * as React from 'react';
import {useRouter} from 'next/router';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MarkEmailReadTwoTone from '@mui/icons-material/MarkEmailReadTwoTone';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function NewsletterToast() {
  const router = useRouter();
  const [hidden, setHidden] = React.useState(router.query.newsletter !== 'subscribed');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  React.useEffect(() => {
    if (router.query.newsletter === 'subscribed') {
      setHidden(false);
      router.replace(router.pathname);
    }
  }, [router.query.newsletter, router]);
  React.useEffect(() => {
    const time = setTimeout(() => {
      if (!hidden) {
        setHidden(true);
      }
    }, 4000);
    return () => {
      clearTimeout(time);
    };
  }, [hidden]);
  return (
    <Slide in={!hidden} timeout={400} direction={isMobile ? 'up' : 'down'}>
      <Box
        sx={[
          {
            position: 'fixed',
            zIndex: 1300,
            top: 80,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            px: 2,
          },
          isMobile && {
            top: 'auto',
            bottom: 16,
          },
        ]}
      >
        <Card
          variant="outlined"
          role="alert"
          sx={[
            (themeArg) => ({
              p: 1.5,
              opacity: hidden ? 0 : 1,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: themeArg.spacing(1),
              maxWidth: 420,
              width: '100%',
              boxShadow: '0px 4px 20px rgba(61, 71, 82, 0.25)',
              pointerEvents: 'auto',
              ...themeArg.applyDarkStyles({
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.6)',
              }),
            }),
            isMobile && {
              alignItems: 'flex-start',
            },
          ]}
        >
          <MarkEmailReadTwoTone color="success" sx={{ mx: 0.5 }} />
          <div>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{
                ml: { xs: 0.5, sm: 1 },
                mr: { xs: 0, sm: 2 },
              }}
            >
              You have subscribed to SUI newsletter.
            </Typography>
          </div>
          <IconButton
            aria-hidden
            size="small"
            onClick={() => setHidden(true)}
            aria-label="close"
            sx={{ ml: { xs: 0, sm: 'auto' } }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Card>
      </Box>
    </Slide>
  );
}
