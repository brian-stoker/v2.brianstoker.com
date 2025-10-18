import Box from "@mui/material/Box";
import GithubCalendar from "../GithubCalendar/GithubCalendar";
import GithubEvents from "../GithubEvents/GithubEvents";
import React from "react";

export default function GithubEventsShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{
  console.log('showcaseContent', showcaseContent);
  return <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    width: '450px', 
    overflow: 'hidden',
    '& .react-activity-calendar': {
      backgroundColor: 'transparent !important',
    },
  }}>
    <GithubCalendar blockSize={10} fx='highlight'/>
    <GithubEvents {...showcaseContent} fx='highlight' />
  </Box>
}
