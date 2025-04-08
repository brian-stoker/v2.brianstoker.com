import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CheckoutIcon from '@mui/icons-material/CallMade';
import { EventDetails } from '../../types/github';
import PullRequestView from '../PullRequest/PullRequestView';

interface PullRequestEventProps {
  event: EventDetails;
}

export default function PullRequestEvent({ event }: PullRequestEventProps): React.JSX.Element | null {
  const [loading, setLoading] = React.useState(true);
  const [prDetails, setPrDetails] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Use a ref to track if we've already loaded data for this PR
  const requestIdRef = React.useRef<string | null>(null);
  const currentRequestId = `${event.repo}-${event.payload?.pull_request?.number}`;
  
  // Prevent navigation only from anchors in the title and buttons
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Check if event is valid
  if (!event?.date) {
    return null;
  }

  const pullRequest = event.payload?.pull_request;
  if (!pullRequest) {
    return null;
  }

  // Extract repo, branches and user info
  const repoFullName = event.repo;
  const [repoOwner, repoName] = repoFullName.split('/');
  const baseBranch = pullRequest.base?.ref || 'unknown';
  const headBranch = pullRequest.head?.ref || 'unknown';
  const authorLogin = pullRequest.user?.login || event.user;
  const authorAvatar = pullRequest.user?.avatar_url || event.avatarUrl;

  // Check if PR is deleted or closed before making API call
  const isPRDeleted = event.payload.action === 'deleted' || 
                      pullRequest.state === 'closed' || 
                      pullRequest.state === 'merged';

  React.useEffect(() => {
    // Skip if this is the same PR we've already loaded
    if (requestIdRef.current === currentRequestId && prDetails !== null) {
      return;
    }
    
    // Track the current request
    requestIdRef.current = currentRequestId;
    
    let isMounted = true;
    const fetchPRDetails = async () => {
      try {
        // If PR is deleted, don't make the API call
        if (isPRDeleted) {
          if (isMounted) {
            setLoading(false);
            setPrDetails({
              title: pullRequest.title,
              number: pullRequest.number,
              state: pullRequest.state,
              merged: pullRequest.merged,
              user: pullRequest.user,
              created_at: pullRequest.created_at,
              updated_at: pullRequest.updated_at,
              closed_at: pullRequest.closed_at,
              merged_at: pullRequest.merged_at,
              commits_list: [],
              files: []
            });
          }
          return;
        }

        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        // Extract owner and repo from the repository URL
        const repoUrl = new URL(pullRequest.html_url);
        const [, owner, repo] = repoUrl.pathname.split('/');
        
        const response = await fetch(`/api/github/pull-request?owner=${owner}&repo=${repo}&pull_number=${pullRequest.number}`);
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
          setError(err instanceof Error ? err.message : 'Failed to load PR details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPRDetails();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [currentRequestId, isPRDeleted]); // Only depend on the request ID, not the entire object

  const handleCheckout = (hash?: string) => {
    // TODO: Implement checkout functionality
    console.log('Checking out', hash || `PR #${pullRequest.number}`);
  };

  // PR Header component with context info
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
          onClick={(e) => {
            e.preventDefault();
            handleCheckout();
          }}
          sx={{ textTransform: 'none' }}
        >
          Checkout
        </Button>
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={pullRequest.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
          onClick={handleLinkClick}
        >
          {pullRequest.title}
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
        {isPRDeleted && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            This pull request is no longer available.
            {pullRequest.state === 'merged' && ' It has been merged.'}
            {pullRequest.state === 'closed' && ' It has been closed.'}
            {event.payload.action === 'deleted' && ' It has been deleted.'}
          </Typography>
        )}
      </Box>
    );
  }

  if (!prDetails) {
    return null;
  }

  // Transform the PR details into the format expected by PullRequestView
  const transformedCommits = (prDetails.commits_list || []).map((commit: any) => ({
    id: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author.name,
      avatar: commit.author?.avatar_url || '',
    },
    date: commit.commit.author.date,
    hash: commit.sha,
  }));

  const transformedFiles = (prDetails.files || []).map((file: any) => ({
    path: file.path,
    type: file.type,
    additions: file.additions,
    deletions: file.deletions,
    diff: file.diff,
  }));

  return (
    <Box sx={{ p: 2 }}>
      <PrHeader />
      <PullRequestView
        title=""  // Set to empty to avoid duplicate title
        number={prDetails.number}
        commits={transformedCommits}
        files={transformedFiles}
        onCheckout={handleCheckout}
      />
    </Box>
  );
}

// Helper function to parse diff content into line objects
function parseDiff(patch: string): Array<{ type: 'addition' | 'deletion' | 'context'; content: string; lineNumber: number }> {
  if (!patch) return [];
  
  return patch.split('\n').map((line, index) => {
    if (line.startsWith('+')) {
      return {
        type: 'addition',
        content: line,
        lineNumber: index + 1,
      };
    } else if (line.startsWith('-')) {
      return {
        type: 'deletion',
        content: line,
        lineNumber: index + 1,
      };
    } else {
      return {
        type: 'context',
        content: line,
        lineNumber: index + 1,
      };
    }
  });
} 