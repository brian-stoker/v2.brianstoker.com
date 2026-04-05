import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';
import { marked } from 'marked';
import EventHeader from './EventHeader';
import { replaceGithubEmoji } from '../../utils/githubEmoji';

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

function CommitRow({ commit, repoFullName, eventAvatarUrl }: { commit: any; repoFullName: string; eventAvatarUrl?: string }) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const authorName = commit.author?.name || commit.author?.login || 'Unknown';
  const authorLogin = commit.author?.login || '';
  const avatarUrl = commit.author?.avatar_url
    || (authorLogin ? `https://github.com/${authorLogin}.png?size=32` : '')
    || eventAvatarUrl
    || '';

  const commitTitle = replaceGithubEmoji(commit.message?.split('\n')[0] || 'No commit message');
  const commitBody = replaceGithubEmoji(commit.message?.split('\n').slice(1).join('\n').trim() || '');

  const handleCopySha = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(commit.sha).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (expanded || !commitBody) {
      // Second click when expanded, or no body to expand — navigate
      window.open(commit.html_url, '_blank', 'noopener,noreferrer');
    } else {
      // First click — expand
      setExpanded(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Double click always navigates directly
    window.open(commit.html_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        transition: 'background-color 0.2s ease',
        backgroundColor: expanded ? 'action.hover' : 'transparent',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      {/* Title row: [avatar] [commit title] [sha] */}
      <Box
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Tooltip title={authorName} arrow placement="top">
          <Avatar
            src={avatarUrl}
            alt={authorName}
            sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
          >
            {authorName[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>

        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            fontWeight: 500,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {commitTitle}
        </Typography>

        <Tooltip title={copied ? 'Copied!' : 'Copy full SHA'} arrow placement="top">
          <Box
            component="span"
            onClick={handleCopySha}
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'text.secondary',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0,
              borderRadius: 0.5,
              px: 0.5,
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 12 }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 12, opacity: 0.6 }} />
            )}
            {commit.sha.substring(0, 7)}
          </Box>
        </Tooltip>
      </Box>

      {/* Expandable body — click to expand, click again to navigate */}
      <Collapse in={expanded && !!commitBody} timeout={450}>
        {commitBody && (
          <Box
            sx={{
              px: 1.5,
              pb: 1.5,
              pt: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              color: 'text.secondary',
              fontSize: '0.8125rem',
              '& h2': { fontSize: '1rem', fontWeight: 600, mt: 1, mb: 0.5 },
              '& h3': { fontSize: '0.9rem', fontWeight: 600, mt: 0.5, mb: 0.25 },
              '& ul': { pl: 2, my: 0.5 },
              '& li': { my: 0.25 },
              '& p': { my: 0.5 },
            }}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(commitBody),
            }}
          />
        )}
      </Collapse>
    </Box>
  );
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
      return replaceGithubEmoji(commits[0].message?.toString()?.split('\n')[0] || '');
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
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Commits
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {commits.map((commit: any) => (
              <CommitRow key={commit.sha} commit={commit} repoFullName={event.repo} eventAvatarUrl={event.avatarUrl} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
