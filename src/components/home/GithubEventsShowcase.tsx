import Box from "@mui/material/Box";
import GithubCalendar from "../GithubCalendar/GithubCalendar";
import GithubEvents from "../GithubEvents/GithubEvents";
import React from "react";

export default function GithubEventsShowcase({ showcaseContent }: { showcaseContent?: any }): React.JSX.Element | null{
  console.log('showcaseContent', showcaseContent);
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '450px' }}>
      <GithubCalendar blockSize={10} />
      <GithubEvents {...showcaseContent} />
    </Box>
}