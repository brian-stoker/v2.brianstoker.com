import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';

const StyledTreeItem = styled(TreeItem)((props) => ({
  '& .MuiTreeItem-content': {
    padding: props.theme.spacing(1),
    borderRadius: props.theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: props.theme.palette.action.hover,
    },
    '& .MuiTreeItem-label': {
      display: 'flex',
      alignItems: 'center',
      gap: props.theme.spacing(1),
    },
  },
}));

const DiffView = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
  fontSize: '12px',
  lineHeight: 1.5,
  overflow: 'auto',
  maxWidth: '100%',
  width: '100%',
  '& pre': {
    margin: 0,
    overflow: 'auto'
  }
}));

const DiffLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type?: 'addition' | 'deletion' | 'context' }>(({ theme, type }) => ({
  padding: '0 16px',
  whiteSpace: 'pre',
  overflowX: 'auto',
  ...(type === 'addition' && {
    backgroundColor: 'rgba(46, 160, 67, 0.15)',
    borderLeft: '4px solid #2ea043',
  }),
  ...(type === 'deletion' && {
    backgroundColor: 'rgba(248, 81, 73, 0.15)',
    borderLeft: '4px solid #f85149',
  }),
  ...(type === 'context' && {
    backgroundColor: 'transparent',
    borderLeft: '4px solid transparent',
  }),
}));

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
  diff: string;
}

interface FileChangesProps {
  files: FileChange[];
}

function parseDiff(patch: string | undefined): Array<{ type: 'addition' | 'deletion' | 'context'; content: string }> {
  if (!patch) return [];
  return patch.split('\n').map(line => {
    if (line.startsWith('+')) {
      return { type: 'addition', content: line };
    }
    if (line.startsWith('-')) {
      return { type: 'deletion', content: line };
    }
    return { type: 'context', content: line };
  });
}

export default function FileChanges({ files }: FileChangesProps): React.JSX.Element {
  const getFileIcon = (type: FileChange['type']) => {
    switch (type) {
      case 'added':
        return <Chip label="A" size="small" color="success" />;
      case 'modified':
        return <Chip label="M" size="small" color="warning" />;
      case 'deleted':
        return <Chip label="D" size="small" color="error" />;
      default:
        return <FileIcon />;
    }
  };

  return (
    <Box>
      {files.map((file, index) => {
        const nodeId = `file-${index}-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const diffLines = parseDiff(file.diff);
        return (
          <Box key={nodeId} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getFileIcon(file.type)}
              <Typography variant="body2">{file.path}</Typography>
              <Typography variant="caption" color="text.secondary">
                +{file.additions} -{file.deletions}
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <DiffView>
                {diffLines.map((line, lineIndex) => (
                  <DiffLine key={`${nodeId}-line-${lineIndex}`} type={line.type}>
                    {line.content}
                  </DiffLine>
                ))}
              </DiffView>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}