import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { EventDetails } from '../../types/github';
import EventHeader from './EventHeader';

interface CreateEventProps {
  event: EventDetails;
}

export default function CreateEvent({ event }: CreateEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const refType = event.payload?.ref_type || 'unknown';
  const refName = event.payload?.ref || 'unknown';
  const repoUrl = `https://github.com/${event.repo}`;
  const description = event.payload?.description;
  const [repoOwner, repoName] = event.repo.split('/');

  return (
    <Box>
      <EventHeader
        eventType="Create Event"
        date={event.date}
        icon={<AddBoxIcon sx={{ fontSize: 24 }} />}
        repoOwner={repoOwner}
        repoName={repoName}
        branchName={refType === 'branch' ? refName : undefined}
        chips={[
          <Chip
            key="ref-type"
            label={refType}
            size="small"
            color="success"
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
          Created {refType} {refName}
        </Link>
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
} 