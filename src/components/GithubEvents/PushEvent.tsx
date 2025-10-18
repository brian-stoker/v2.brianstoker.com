import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CodeIcon from '@mui/icons-material/Code';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';
import NextLink from "next/link";
import { marked } from 'marked';

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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: 'action.selected',
            flexShrink: 0
          }}>
            <CodeIcon sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Push Event
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {event.date}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <NextLink
                  href={`https://github.com/${repoOwner}`}
                  passHref
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontSize: '0.875rem'
                  }}
                >
                  {repoOwner}
                </NextLink>
                <Typography variant="body2" color="text.secondary">
                  /
                </Typography>
                <NextLink
                  href={`https://github.com/${event.repo}`}
                  passHref
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {repoName}
                </NextLink>
              </Box>
              <Chip
                label={branchName}
                size="small"
                color="default"
                variant="outlined"
              />
              <Chip
                label={`${commitCount} commit${commitCount !== 1 ? 's' : ''}`}
                size="small"
                color="default"
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" component="h3">
          <NextLink
            href={event.url}
            passHref
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {summary}
          </NextLink>
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
                  <NextLink
                    href={commit.html_url}
                    passHref
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {commit.sha.substring(0, 7)}
                    </Typography>
                  </NextLink>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    <NextLink
                      href={commit.html_url}
                      passHref
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {commit.message?.split('\n')[0] || 'No commit message'}
                    </NextLink>
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
