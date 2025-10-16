import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CheckoutIcon from '@mui/icons-material/CallMade';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileChanges from '../PullRequest/FileChanges';

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
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            <Link href={commit.html_url} passHref legacyBehavior>
              <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                {commit.commit.message.split('\n')[0]}
              </a>
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {commit.sha.substring(0, 7)} by {commit.commit.author.name}
          </Typography>
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {event.date}
          </Typography>
          <Chip
            label={`${repoOwner}/${repoName}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`#${pullRequest.number}`}
            size="small"
            color="default"
          />
          <Chip
            label={pullRequest.state}
            size="small"
            color={pullRequest.state === 'open' ? 'success' : 'error'}
          />
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CheckoutIcon />}
          onClick={handleCheckout}
          sx={{ textTransform: 'none' }}
        >
          Checkout
        </Button>
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link
          href={pullRequest.html_url}
          passHref
          legacyBehavior>
          <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            {pullRequest.title}
          </a>
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
    <Box sx={{ p: 2 }}>
      <PrHeader />
      
      {prDetails.body && (
        <Accordion sx={{ mt: 2, backgroundColor: 'transparent', border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Description</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {prDetails.body}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Commits (${(prDetails.commits_list || []).length})`} />
          <Tab label={`Files changed (${(prDetails.files || []).length})`} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ mt: 2 }}>
          {(prDetails.commits_list || []).map((commit: any) => (
            <Commit key={commit.sha} commit={commit} repo={repoFullName} />
          ))}
        </Box>
      )}
      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <FileChanges files={transformedFiles} />
        </Box>
      )}
    </Box>
  );
}