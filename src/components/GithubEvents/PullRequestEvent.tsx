import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CheckoutIcon from '@mui/icons-material/CallMade';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';
import NextLink from "next/link";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileChanges from '../PullRequest/FileChanges';
import { marked } from 'marked';

// Helper function to render markdown text
function renderMarkdown(text: string): string {
  if (!text) return '';
  return marked(text, {
    breaks: true,
    gfm: true
  }) as string;
}

// Commit component copied from PushEvent.tsx
interface File {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

interface CommitProps {
  commit: any;
  repo: string;
}

function Commit({ commit, repo }: CommitProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();

  const fetchFiles = async () => {
    if (files.length > 0) return; // Don't refetch if already loaded

    setLoading(true);
    setError(null);
    try {
      const [owner, repoName] = repo.split('/');
      const response = await fetch(`/api/github/commit-files?owner=${owner}&repo=${repoName}&sha=${commit.sha}`);
      if (!response.ok) {
        throw new Error('Failed to fetch commit files');
      }
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    if (isExpanded) {
      fetchFiles();
    }
  };

  return (
    <Accordion
      sx={{ mt: 1, backgroundColor: 'transparent', border: `1px solid ${theme.palette.divider}` }}
      onChange={handleAccordionChange}
      expanded={expanded}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  {commit.commit.message.split('\n')[0]}
                </NextLink>
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              by {commit.commit.author.name}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {loading && <CircularProgress size={24} />}
        {error && <Typography color="error">{error}</Typography>}
        {files.length > 0 && (
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {files.map((file: File) => (
              <Typography
                key={file.filename}
                component="li"
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  color: file.status === 'added' ? 'success.main' : file.status === 'modified' ? 'info.main' : file.status === 'removed' ? 'error.main' : 'text.primary'
                }}
              >
                {file.status === 'added' && '+ '}
                {file.status === 'modified' && '~ '}
                {file.status === 'removed' && '- '}
                {file.filename}
              </Typography>
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}


interface PullRequestEventProps {
  event: EventDetails;
}

export default function PullRequestEvent({ event }: PullRequestEventProps): React.JSX.Element | null {
  const [loading, setLoading] = React.useState(true);
  const [prDetails, setPrDetails] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const requestIdRef = React.useRef<string | null>(null);
  const currentRequestId = `${event.repo}-${event.payload?.pull_request?.number}`;

  if (!event?.date) {
    return null;
  }

  const pullRequest = event.payload?.pull_request;
  if (!pullRequest) {
    return null;
  }

  const repoFullName = event.repo;
  const [repoOwner, repoName] = repoFullName.split('/');
  const baseBranch = pullRequest.base?.ref || 'unknown';
  const headBranch = pullRequest.head?.ref || 'unknown';
  const authorLogin = pullRequest.user?.login || event.user;
  const authorAvatar = pullRequest.user?.avatar_url || event.avatarUrl;

  const isPRDeleted = event.payload.action === 'deleted' ||
                      pullRequest.state === 'closed' ||
                      pullRequest.state === 'merged';

  React.useEffect(() => {
    if (requestIdRef.current === currentRequestId && prDetails !== null) {
      setLoading(false);
      return;
    }

    requestIdRef.current = currentRequestId;

    let isMounted = true;
    const fetchPRDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (pullRequest._enriched) {
          if (isMounted) {
            setPrDetails(pullRequest);
          }
          return;
        }

        if (isPRDeleted) {
          if (isMounted) {
            setPrDetails({
              ...pullRequest,
              commits_list: [],
              files: []
            });
          }
          return;
        }

        const response = await fetch(`/api/github/pull-request?owner=${repoOwner}&repo=${repoName}&pull_number=${pullRequest.number}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PR details');
        }

        const data = await response.json();
        if (isMounted) {
          setPrDetails(data);
        }
      } catch (err) {
        console.error('Error fetching PR details:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setPrDetails({
            ...pullRequest,
            body: pullRequest.body || 'This pull request is no longer accessible (may be deleted or from a private repository).'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPRDetails();

    return () => {
      isMounted = false;
    };
  }, [currentRequestId, isPRDeleted, pullRequest, repoOwner, repoName]);

  const handleCheckout = () => {
    const command = `git fetch origin pull/${pullRequest.number}/head:${headBranch} && git checkout ${headBranch}`;
    navigator.clipboard.writeText(command);
    // Optionally, provide user feedback that the command has been copied.
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const PrHeader = () => (
    <Box sx={{ mb: 2 }}>
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
          <CallSplitIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Pull Request
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
                href={`https://github.com/${repoFullName}`}
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
            <NextLink
              href={pullRequest.html_url}
              passHref
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label={`#${pullRequest.number}`}
                size="small"
                color="default"
                clickable
              />
            </NextLink>
            <Chip
              label={pullRequest.state}
              size="small"
              color={pullRequest.state === 'open' ? 'success' : 'error'}
            />
            {/* <Button
              variant="outlined"
              size="small"
              startIcon={<CheckoutIcon />}
              onClick={handleCheckout}
              sx={{ textTransform: 'none', ml: 'auto' }}
            >
              Checkout
            </Button> */}
          </Box>
        </Box>
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        <NextLink
          href={pullRequest.html_url}
          passHref
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {pullRequest.title}
        </NextLink>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Avatar
          src={authorAvatar}
          alt={authorLogin}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="body2">
          {authorLogin}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          wants to merge from
        </Typography>
        <Chip
          label={headBranch}
          size="small"
          color="default"
          variant="outlined"
        />
        <Typography variant="body2" color="text.secondary">
          into
        </Typography>
        <Chip
          label={baseBranch}
          size="small"
          color="default"
          variant="outlined"
        />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <PrHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <PrHeader />
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!prDetails) {
    return null;
  }
  
  const transformedFiles = (prDetails.files || []).map((file: any) => ({
    path: file.filename,
    type: file.status,
    additions: file.additions,
    deletions: file.deletions,
    diff: file.patch, // Assuming patch contains the diff
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <PrHeader />
      </Box>

      {/* Scrollable Description Section */}
      {prDetails.body && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
            Description
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              maxHeight: '200px',
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
                __html: renderMarkdown(prDetails.body)
              }}
            />
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Commits (${(prDetails.commits_list || []).length})`} />
          <Tab label={`Files changed (${(prDetails.files || []).length})`} />
        </Tabs>
      </Box>

      {/* Scrollable Tab Content */}
      <Box sx={{ 
        maxHeight: 'calc(100vh - 236px - 75px - 300px)', 
        overflow: 'auto',
        '& .MuiPaper-root': {
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}>
        {tabValue === 0 && (
          <Box>
            {(prDetails.commits_list || []).map((commit: any) => (
              <Commit key={commit.sha} commit={commit} repo={repoFullName} />
            ))}
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <FileChanges files={transformedFiles} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
