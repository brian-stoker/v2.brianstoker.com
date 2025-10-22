import Box from "@mui/material/Box";
import GithubEvents from "../GithubEvents/GithubEvents";
import React from "react";

export default function GithubEventsShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{
  console.log('showcaseContent', showcaseContent);
  return <Box sx={{
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    '& .react-activity-calendar': {
      backgroundColor: 'transparent !important',
    },
  }}>
    <GithubEvents {...showcaseContent} fx='highlight' column />
  </Box>
}

