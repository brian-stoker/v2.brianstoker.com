import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EventDetails } from '../../types/github';
import { useTheme } from '@mui/material/styles';

interface PushEventProps {
  event: EventDetails;
}

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
                {commit.message?.split('\n')[0]}
              </a>
            </Link>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {commit.sha.substring(0, 7)} by {commit.author.name}
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


export default function PushEvent({ event }: PushEventProps): React.JSX.Element | null {
  const theme = useTheme();
  if (!event?.date) {
    return null;
  }

  const branchName = event.ref?.replace('refs/heads/', '') || 'main';
  const commits = event.commitsList || [];
  const commitCount = commits.length > 0 ? commits.length : (event.commits || 0);

  const getSummary = () => {
    if (commits.length === 1) {
      return commits[0].message?.split('\n')[0];
    }
    if (commits.length > 1) {
      return `Pushed ${commitCount} commits to ${branchName}`;
    }
    return event.description || 'No commit message available';
  };

  const summary = getSummary();

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip
          label={branchName}
          size="small"
          color="default"
        />
        <Chip
          label={`${commitCount} commit${commitCount !== 1 ? 's' : ''}`}
          size="small"
          color="primary"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link href={event.url} passHref legacyBehavior>
          <a target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            {summary}
          </a>
        </Link>
      </Typography>

      {commits.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Commits</Typography>
          {commits.map((commit: any) => (
            <Commit key={commit.sha} commit={commit} repo={event.repo} />
          ))}
        </Box>
      )}
    </Box>
  );
}
