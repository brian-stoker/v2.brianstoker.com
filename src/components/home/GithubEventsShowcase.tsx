import Box from "@mui/material/Box";
import GithubEvents from "../GithubEvents/GithubEvents";
import React from "react";

export default function GithubEventsShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{
  return <Box sx={{
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '970px',
    overflowY: 'auto',
    alignSelf: 'flex-start',
    '& .react-activity-calendar': {
      backgroundColor: 'transparent !important',
    },
  }}>
    <GithubEvents {...showcaseContent} fx='highlight' />
  </Box>
}

