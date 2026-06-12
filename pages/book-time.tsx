import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
      }}
    >

      <CalendarBooking
        apiBaseUrl=""
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Box>
  );
}

export default function BookTime() {
  return <HomeView HomeMain={BookTimeView} noSection />;
}
