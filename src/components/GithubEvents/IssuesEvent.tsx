import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EventDetails } from '../../types/github';

interface IssuesEventProps {
  event: EventDetails;
}

export default function IssuesEvent({ event }: IssuesEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const issue = event.payload?.issue;
  if (!issue) {
    return null;
  }

  const issueTitle = issue.title || event.description;
  const issueUrl = issue.html_url || event.url;
  const issueState = issue.state || 'unknown';
  const issueAction = event.payload?.action || 'unknown';
  const issueNumber = issue.number || event.number;
  const issueUser = issue.user?.login || event.user;
  const issueComments = issue.comments || event.comments;
  const issueLabels = issue.labels || [];
  const issueBody = issue.body;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={`#${issueNumber}`} 
          size="small" 
          color="default"
        />
        <Chip 
          label={issueState} 
          size="small" 
          color={issueState === 'open' ? 'success' : 'error'}
        />
        <Chip 
          label={`${issueComments} comment${issueComments !== 1 ? 's' : ''}`}
          size="small"
          color="default"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={issueUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {issueTitle}
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: issueLabels.length > 0 ? 2 : 0 }}>
        <Typography variant="body2" color="text.secondary">
          {issueAction} by {issueUser}
        </Typography>
      </Box>

      {issueLabels.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {issueLabels.map((label: any) => (
            <Chip
              key={label.name}
              label={label.name}
              size="small"
              sx={{
                backgroundColor: `#${label.color}`,
                color: label.color === 'ffffff' ? 'text.primary' : '#fff'
              }}
            />
          ))}
        </Box>
      )}

      {issueBody && (
        <Accordion sx={{ backgroundColor: 'transparent', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Description</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {issueBody}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
} 