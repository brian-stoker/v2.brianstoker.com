import * as React from 'react';
import Box from "@mui/material/Box";
import {HomeView} from "./index";
import GithubCalendar from 'src/components/GithubCalendar/GithubCalendar';
import GithubEvents from 'src/components/GithubEvents/GithubEvents';
import { useTheme } from '@mui/material/styles';
export function WorkView({ pdfMinWidth = 900}: { pdfMinWidth?: number }) {
  const theme = useTheme();
  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper }}>
      <GithubCalendar />
      <GithubEvents />
    </Box>
  );
}

export default function Work({HomeMain}: { HomeMain: React.ComponentType }) {
  return <HomeView HomeMain={WorkView}/>;
}
