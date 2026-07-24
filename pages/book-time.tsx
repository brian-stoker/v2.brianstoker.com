import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Head from '../src/modules/components/Head';
import { HomeView } from './index';
import { CalendarBooking } from '@stoked-ui/common';

function BookTimeView() {
  const handleSuccess = (eventId: string, eventLink: string) => {
    console.log('Appointment booked:', { eventId, eventLink });
  };

  const handleError = (error: string) => {
    console.error('Booking error:', error);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        pt: 2,
        pb: 6,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        component="h1"
        variant="h3"
        sx={{ fontWeight: 800, mb: { xs: 3, sm: 4 }, alignSelf: { xs: 'flex-start', md: 'center' } }}
      >
        Meet
      </Typography>

      <CalendarBooking
        apiBaseUrl=""
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Box>
  );
}

export default function BookTime() {
  return (
    <React.Fragment>
      <Head title="Meet" description="Book time with Brian Stoker" />
      <HomeView HomeMain={BookTimeView} noSection />
    </React.Fragment>
  );
}
