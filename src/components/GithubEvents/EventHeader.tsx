import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

interface EventHeaderProps {
  eventType: string;
  date: string;
  icon: React.ReactNode;
  repoOwner: string;
  repoName: string;
  branchName?: string;
  chips?: React.ReactNode[];
}

export default function EventHeader({
  eventType,
  date,
  icon,
  repoOwner,
  repoName,
  branchName,
  chips = []
}: EventHeaderProps) {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      mb: 2, 
      backgroundColor: (theme) => theme.palette.background.paper,
      padding: 1,
      borderRadius: '8px'
    }} >
      <Box sx={{ flexGrow: 1, minWidth: 0, marginLeft: 1, gap: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
           <Typography variant="subtitle2" fontWeight="bold">
            {eventType}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {date}
          </Typography>
         
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <a
              href={`https://github.com/${repoOwner}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem',
                borderImage: 0
              }}
            >
              {repoOwner}
            </a>
            <Typography variant="body2" color="text.secondary">
              /
            </Typography>
            <a
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {repoName}
            </a>

          </Box>
          {branchName && <a
              href={`https://github.com/${repoOwner}/${repoName}/tree/${branchName}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            ><Chip
            key="branch"
            label={branchName}
            size="small"
            color="default"
            variant="outlined"
          /></a>}
          
        </Box>
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
        {chips.map((chip, index) => (
          <React.Fragment key={index}>{chip}</React.Fragment>
        ))}
      </Box>
      <IconButton
        size="small"
        color="primary"
        disableRipple
        sx={{
          width: 52,
          height: 52,
          borderRadius: 1,
          backgroundColor: (theme) => theme.palette.action.selected,
          flexShrink: 0,
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.primaryDark?.[700] || 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        {icon}
      </IconButton>
    </Box>
  );
}
