import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import CommentIcon from '@mui/icons-material/Comment';
import { EventDetails } from '../../types/github';
import { marked } from 'marked';

// Helper function to render markdown text
function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked(text, {
    breaks: true,
    gfm: true
  }) as string;
}

interface IssueCommentEventProps {
  event: EventDetails;
}

export default function IssueCommentEvent({ event }: IssueCommentEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const issue = event.payload?.issue;
  const comment = event.payload?.comment;
  if (!issue || !comment) {
    return null;
  }

  // Extract repository information
  const repoFullName = event.repo;
  const [repoOwner, repoName] = repoFullName.split('/');

  // Extract issue information
  const issueTitle = issue.title;
  const issueUrl = issue.html_url;
  const issueState = issue.state || 'unknown';
  const issueNumber = issue.number;
  const issueAuthor = issue.user?.login;
  const issueAuthorAvatar = issue.user?.avatar_url;

  // Extract comment information
  const commentUrl = comment.html_url;
  const commentBody = comment.body;
  const commentUser = comment.user?.login || event.user;
  const commentUserAvatar = comment.user?.avatar_url || event.avatarUrl;
  const commentCreatedAt = comment.created_at || event.date;

  // Get other comments if available
  const otherComments = event.payload?.comments || [];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with icon, event type, and metadata */}
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
          <CommentIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Issue Comment
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
              <Link
                href={`https://github.com/${repoOwner}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {repoOwner}
              </Link>
              <Typography variant="body2" color="text.secondary">
                /
              </Typography>
              <Link
                href={`https://github.com/${repoFullName}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {repoName}
              </Link>
            </Box>
            <Link
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
            </Link>
            <Chip
              label={issueState}
              size="small"
              color={issueState === 'open' ? 'success' : 'error'}
            />
          </Box>
        </Box>
      </Box>

      {/* Issue title as a link */}
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

      {/* Issue author if available */}
      {issueAuthor && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Issue by:
          </Typography>
          <Avatar
            src={issueAuthorAvatar}
            alt={issueAuthor}
            sx={{ width: 20, height: 20 }}
          />
          <Typography variant="body2">
            {issueAuthor}
          </Typography>
        </Box>
      )}

      {/* Comment information with avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar 
          src={commentUserAvatar} 
          alt={commentUser}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="body2">
          {commentUser}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          commented on {new Date(commentCreatedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Comment content */}
      <Box sx={{
        p: 2,
        backgroundColor: 'action.hover',
        borderRadius: 1,
        position: 'relative',
        mb: 2,
        maxHeight: 200,
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
          __html: renderMarkdown(commentBody)
        }}
      />
      <Box sx={{
        position: 'relative',
        textAlign: 'right',
        mt: -1,
        mb: 2
      }}>
        <Link
          href={commentUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: 'none',
            fontSize: '0.75rem'
          }}
        >
          View on GitHub
        </Link>
      </Box>

      {/* Other comments summary if available */}
      {otherComments.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Other comments on this issue:
          </Typography>
          {otherComments.slice(0, 3).map((otherComment: any) => (
            <Box 
              key={otherComment.id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 1
              }}
            >
              <Avatar 
                src={otherComment.user?.avatar_url} 
                alt={otherComment.user?.login}
                sx={{ width: 20, height: 20 }}
              />
              <Typography variant="body2">
                {otherComment.user?.login}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {otherComment.body?.substring(0, 50)}
                {otherComment.body?.length > 50 ? '...' : ''}
              </Typography>
            </Box>
          ))}
          {otherComments.length > 3 && (
            <Typography variant="caption" color="text.secondary">
              +{otherComments.length - 3} more comments
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
} 