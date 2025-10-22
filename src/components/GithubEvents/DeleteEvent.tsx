import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import { EventDetails } from '../../types/github';
import EventHeader from './EventHeader';

interface DeleteEventProps {
  event: EventDetails;
}

export default function DeleteEvent({ event }: DeleteEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const refType = event.payload?.ref_type || 'unknown';
  const refName = event.payload?.ref || 'unknown';
  const repoUrl = `https://github.com/${event.repo}`;
  const [repoOwner, repoName] = event.repo.split('/');

  return (
    <Box>
      <EventHeader
        eventType="Delete Event"
        date={event.date}
        icon={<DeleteIcon sx={{ fontSize: 24 }} />}
        repoOwner={repoOwner}
        repoName={repoName}
        chips={[
          <Chip
            key="ref-type"
            label={refType}
            size="small"
            color="error"
          />
        ]}
      />

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          Deleted {refType} {refName}
        </Link>
      </Typography>
    </Box>
  );
} 