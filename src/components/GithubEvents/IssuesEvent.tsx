import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';
import { EventDetails } from '../../types/github';
import { marked } from 'marked';
import EventHeader from './EventHeader';

// Helper function to render markdown text
function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked(text, {
    breaks: true,
    gfm: true
  }) as string;
}

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
  const issueComments = issue.comments || event.comments;
  const issueLabels = issue.labels || [];
  const issueBody = issue.body;
  const [repoOwner, repoName] = event.repo.split('/');

  return (
    <Box >
      <EventHeader
        eventType={`Issue ${issueAction}`}
        date={event.date}
        icon={<BugReportIcon sx={{ fontSize: 24 }} />}
        repoOwner={repoOwner}
        repoName={repoName}
        chips={[
          <Link
            key="issue-number"
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none' }}
          >
            <Chip
              label={`#${issueNumber}`}
              size="small"
              color="default"
              clickable
            />
          </Link>,
          <Chip
            key="issue-state"
            label={issueState}
            size="small"
            color={issueState === 'open' ? 'success' : 'error'}
          />,
          <Chip
            key="issue-comments"
            label={`${issueComments} comment${issueComments !== 1 ? 's' : ''}`}
            size="small"
            color="default"
          />
        ]}
      />

      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        <Link
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {issueTitle}
        </Link>
      </Typography>

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
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Description
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              maxHeight: '300px',
              overflow: 'auto',
              '& h1': {
                fontSize: '1.5rem',
                fontWeight: 600,
                mt: 2,
                mb: 1
              },
              '& h2': {
                fontSize: '1.25rem',
                fontWeight: 600,
                mt: 1.5,
                mb: 1
              },
              '& h3': {
                fontSize: '1.1rem',
                fontWeight: 600,
                mt: 1,
                mb: 0.5
              },
              '& ul, & ol': {
                pl: 3,
                my: 1
              },
              '& li': {
                my: 0.5
              },
              '& p': {
                my: 1
              },
              '& code': {
                backgroundColor: 'action.selected',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: 'monospace',
                fontSize: '0.875em'
              },
              '& pre': {
                backgroundColor: 'action.selected',
                p: 1.5,
                borderRadius: 1,
                overflow: 'auto',
                my: 1
              },
              '& pre code': {
                backgroundColor: 'transparent',
                p: 0
              }
            }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(issueBody)
            }}
          />
        </Box>
      )}
    </Box>
  );
} 
