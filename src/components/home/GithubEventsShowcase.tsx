import Box from "@mui/material/Box";
import GithubCalendar from "../GithubCalendar/GithubCalendar";
import GithubEvents from "../GithubEvents/GithubEvents";
import React from "react";

export default function GithubEventsShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{
  console.log('showcaseContent', showcaseContent);
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    '& .react-activity-calendar': {
      backgroundColor: 'transparent !important',
    },
  }}>
    <GithubEvents {...showcaseContent} fx='highlight' column />
  </Box>
}
