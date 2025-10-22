import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CodeIcon from '@mui/icons-material/Code';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';
import NextLink from "next/link";
import { marked } from 'marked';
import EventHeader from './EventHeader';

interface PushEventProps {
  event: EventDetails;
}

// Helper function to render markdown text
function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked(text, {
    breaks: true,
    gfm: true
  }) as string;
}

export default function PushEvent({ event }: PushEventProps): React.JSX.Element | null {
  const theme = useTheme();
  if (!event?.date) {
    return null;
  }

  const branchName = event.ref?.replace('refs/heads/', '') || 'main';

  // Try to get commits from commitsList first, then fall back to payload.commits
  let commits = event.commitsList || [];
  if (commits.length === 0 && event.payload?.commits) {
    commits = event.payload.commits.map((commit: any) => ({
      message: commit.message,
      sha: commit.sha,
      author: commit.author,
      html_url: `https://github.com/${event.repo}/commit/${commit.sha}`
    }));
  }

  const commitCount = commits.length > 0 ? commits.length : (event.commits || event.payload?.size || 0);

  const getSummary = () => {
    if (commits.length === 1) {
      return commits[0].message?.toString()?.split('\n')[0];
    }
    if (commits.length > 1) {
      return `Pushed ${commitCount} commits to ${branchName}`;
    }
    return event.description || 'No commit message available';
  };

  const summary = getSummary();
  const [repoOwner, repoName] = event.repo.split('/');

  return (
    <Box>
      {/* Header with icon, event type, and metadata */}
      <Box sx={{ mb: 2 }}>
        <EventHeader
          eventType="Push Event"
          date={event.date}
          icon={<CodeIcon sx={{ fontSize: 24 }} />}
          repoOwner={repoOwner}
          repoName={repoName}
          branchName={branchName}
          chips={[
            <Chip
              key="commits"
              label={`${commitCount} commit${commitCount !== 1 ? 's' : ''}`}
              size="small"
              color="default"
            />
          ]}
        />

        <Typography variant="h6" component="h3">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {summary}
          </a>
        </Typography>
      </Box>

      {commits.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Commits
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: 'calc(100vh - 236px - 75px - 200px)',
            overflow: 'auto'
          }}>
            {commits.map((commit: any) => (
              <Box
                key={commit.sha}
                sx={{
                  p: 2,
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {commit.sha.substring(0, 7)}
                    </Typography>
                  </a>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {commit.message?.split('\n')[0] || 'No commit message'}
                    </a>
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  by {commit.author?.name || 'Unknown'}
                </Typography>
                {commit.message?.split('\n').slice(1).join('\n').trim() && (
                  <Box
                    sx={{
                      color: 'text.secondary',
                      maxHeight: '150px',
                      overflow: 'auto',
                      '& h2': {
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        mt: 1.5,
                        mb: 1
                      },
                      '& h3': {
                        fontSize: '1rem',
                        fontWeight: 600,
                        mt: 1,
                        mb: 0.5
                      },
                      '& ul': {
                        pl: 2,
                        my: 0.5
                      },
                      '& li': {
                        my: 0.25
                      },
                      '& p': {
                        my: 0.5
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(commit.message?.split('\n').slice(1).join('\n'))
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
