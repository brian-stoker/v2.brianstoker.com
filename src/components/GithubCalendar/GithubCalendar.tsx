import * as React from 'react';
import { Box } from "@mui/material";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from '@mui/material/styles';
import useResize from 'src/hooks/useResize';
import useResizeWindow from 'src/hooks/useResizeWindow';

interface ActivityData {
   total: Record<string, number>,
   contributions: { 
    date: string,
    count: number,
    level: number
   }[],
   countLabel?: string,
   blockSize?: number,
   totalWeeks?: number
}

const defaultActivityData = { total: {}, contributions: [], countLabel: 'Loading...' };  

export default function GithubCalendar({ windowMode = false, containerMode = false, blockSize: inputBlockSize = 12 }: { windowMode?: boolean, containerMode?: boolean, blockSize?: number }) {
  const [activityTheme, setActivityTheme] = React.useState<'light' | 'dark'>('light');
  const [activityData, setActivityData] = React.useState<ActivityData>(defaultActivityData);
  const [activityLoading, setActivityLoading] = React.useState<boolean>(true);
  const [activityHover, setActivityHover] = React.useState<boolean>(false);
  const [activityLabels, setActivityLabels] = React.useState<boolean>(false);
  const [activityClass, setActivityClass] = React.useState<string>('activity');
  const [labelsTimer, setLabelsTimer] = React.useState<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const elementRef = React.useRef(null);
  const [windowWidth, _] = useResizeWindow();
  const elemSize= useResize(elementRef);


  React.useEffect(() => {
    if (inputBlockSize) {
      return;
    }
    if (activityData.totalWeeks) {
      if (windowMode) {
        activityData.blockSize = Math.max(10, Math.floor(windowWidth / activityData.totalWeeks));
        setActivityData({...activityData});
      } else if (containerMode) {
        if (elemSize.width) {
          activityData.blockSize = Math.max(10, Math.floor(elemSize.width / activityData.totalWeeks));
          setActivityData({...activityData});
        }
      }
    }
  }, [elemSize.width, windowWidth])

  React.useEffect(() => {
    if (activityHover && !activityLabels) {
      setLabelsTimer(setTimeout(() => {
        setActivityLabels(true);
      }, 200));
    } else if (!activityHover && (activityLabels || labelsTimer)) {
      setActivityLabels(false);
      if (labelsTimer) {
        clearTimeout(labelsTimer);
      }
    }
    setActivityClass('activity ' + (activityLabels ? 'hover labels' : activityHover ? 'hover' : ''));
  }, [activityHover, activityLabels]);
  
  // Scroll activity all the way to the right on mount
  React.useEffect(() => {
    
    if (!activityLoading) {
      setTimeout(() => {
        const activityContainer = document.querySelector('.react-activity-calendar__scroll-container') as HTMLElement;
        if (activityContainer) {
          activityContainer.scrollLeft = activityContainer.scrollWidth;
        }
      }, 200);
    }
  }, [activityLoading]);

  const fetchActivityData = async () => {
    setActivityLoading(true);
    
    try {
      const response = await fetch('https://github-contributions-api.jogruber.de/v4/brian-stoker?yr=last');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ActivityData = await response.json();
      const all = (Object.values(data.total) as number[]).reduce((acc, curr) => acc + curr, 0);
      const totalKeys = Object.keys(data.total);
      data.countLabel = `${all} contributions from ${totalKeys[0]} to ${totalKeys[totalKeys.length - 1]}`;
      data.totalWeeks = data.contributions.length / 7
      if (inputBlockSize) {
        data.blockSize = inputBlockSize;
      } else if (windowMode) {
        data.blockSize = Math.max(10, Math.floor(windowWidth / data.totalWeeks));
      } else {
        if (elemSize.width) {
          data.blockSize = Math.max(10, Math.floor(elemSize.width / data.totalWeeks));
        }
      }
      setActivityData(data);
    } catch (err) {
      console.error(`Error fetching activity data: ${err instanceof Error ? err.message : String(err)}`);
      // Use fallback data if API fails
      setActivityData(defaultActivityData);
    } finally {
      setActivityLoading(false);
    }
  };
  
  // Initial load
  React.useEffect(() => {
    fetchActivityData();
  },[]);

  React.useEffect(() => {
    setActivityTheme(theme.palette.mode === 'dark' ? 'dark' : 'light');
  }, [theme.palette.mode])

  return (
     <Box 
        ref={elementRef}
        onMouseEnter={() => setActivityHover(true)}
        onMouseLeave={() => {
          setActivityHover(false);
          setActivityLabels(false);
        }}
        className={activityClass}
        sx={{
          '& .activity > *': {
            transition: '1s ease-in-out',
          },
          position: 'sticky',
        }}
      >
        <ActivityCalendar 
          data={activityData.contributions} 
          theme={{
            light: activityTheme === 'light' ? ['hsl(0, 0%, 92%)', theme.palette.primary.dark] : ['hsl(0, 0%, 12%)', theme.palette.primary.light], 
            dark: activityTheme === 'light' ? ['hsl(0, 0%, 92%)', theme.palette.primary.dark] : ['hsl(0, 0%, 12%)', theme.palette.primary.light], 
          }}
          loading={activityLoading}
          blockMargin={0.5}
          blockRadius={0}
          blockSize={activityData.blockSize || 25}
          style={{
            backgroundColor: theme.palette.background.paper,
          }}
          labels={{
            totalCount: activityData.countLabel
          }}
        
        />
      </Box>
  )
}