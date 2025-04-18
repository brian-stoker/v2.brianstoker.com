import * as React from 'react';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { styled, useTheme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Pagination from '@mui/material/Pagination';
import dynamic from 'next/dynamic';

interface GitHubEvent {
  id: string; 
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any;
}

interface EventDetails {
  id: string;
  date: string;
  repo: string;
  action: string;
  actionType: string;
  description: string;
  link: string;
  detailsMarkdown: string;
  payload: any;
}

interface CachedData {
  events: GitHubEvent[];
  lastFetched: number;
  totalCount: number;
}

// Import react-json-view dynamically to avoid SSR issues
const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false,
  loading: () => <div>Loading JSON viewer...</div>
});

const MetadataDisplay = styled(Box)(({ theme }) => {
  return {
    display: 'block',
    position: 'sticky',
    width: '100%',
    top: 80,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    p: 2,
    marginLeft: 0,
    zIndex: 100,
    padding: 8,
    marginRight: 0,
    fontSize: '0.875rem',
  }
})

export default function GithubEvents({ eventsPerPage = 40, hideMetadata = false }: { eventsPerPage?: number, hideMetadata?: boolean }) {

  const [events, setEvents] = React.useState<EventDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [repoFilter, setRepoFilter] = React.useState<string>('');
  const [actionFilter, setActionFilter] = React.useState<string>('');
  const [repositories, setRepositories] = React.useState<string[]>([]);
  const [actionTypes, setActionTypes] = React.useState<string[]>([]);
  const [dateFilter, setDateFilter] = React.useState<string>('');
  const [descriptionFilter, setDescriptionFilter] = React.useState<string>('');
  const [descriptions, setDescriptions] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [cachedEvents, setCachedEvents] = React.useState<GitHubEvent[]>([]);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [selectedEvent, selectEvent] = React.useState<any>({ id: null });
  const theme = useTheme();
  
  // Load cached data on mount
  React.useEffect(() => {
    const cached = localStorage.getItem('github_events');
    if (cached) {
      try {
        const parsedCache: CachedData = JSON.parse(cached);
        setCachedEvents(parsedCache.events);
        setTotalCount(parsedCache.totalCount);
        buildFilterOptionsFromEvents(parsedCache.events);
        
        // Format last updated time
        const lastFetchDate = new Date(parsedCache.lastFetched);
        setLastUpdated(format(lastFetchDate, 'MMM d, yyyy h:mm a'));
        
        // Check if we should fetch new events (if it's been more than 8 hours)
        const hoursSinceLastFetch = (Date.now() - parsedCache.lastFetched) / (1000 * 60 * 60);
        if (hoursSinceLastFetch >= 8) {
          fetchNewEvents();
        }
      } catch (err) {
        console.error('Failed to parse cached events:', err);
        fetchGitHubEvents(1);
      }
    } else {
      fetchGitHubEvents(1);
    }
  }, []);

  const fetchNewEvents = async () => {
    try {
      // First, get the most recent event date from our cache
      let mostRecentDate = new Date(0);
      if (cachedEvents.length > 0) {
        mostRecentDate = new Date(Math.max(...cachedEvents.map(e => new Date(e.created_at).getTime())));
      }

      const response = await fetch('/api/github/events?page=1&per_page=100');
      if (!response.ok) throw new Error('Failed to fetch new events');
      const data = await response.json();
      
      // Filter out events we already have and add new ones
      const newEvents = [...cachedEvents];
      let hasNewEvents = false;
      
      data.events.forEach((event: GitHubEvent) => {
        const eventDate = new Date(event.created_at);
        if (eventDate > mostRecentDate && !newEvents.some(e => 
          e.created_at === event.created_at && e.repo.name === event.repo.name
        )) {
          newEvents.push(event);
          hasNewEvents = true;
        }
      });
      
      if (hasNewEvents) {
        // Sort events by date (newest first)
        newEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Update cache with new events
        setCachedEvents(newEvents);
        localStorage.setItem('github_events', JSON.stringify({
          events: newEvents,
          lastFetched: Date.now(),
          totalCount: newEvents.length
        }));
        
        // Update UI
        buildFilterOptionsFromEvents(newEvents);
        setTotalCount(newEvents.length);
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
        
        // If we're on the first page, update the displayed events
        if (page === 1) {
          const filteredEvents = filterEvents(newEvents);
          const processedEvents = processEvents(filteredEvents.slice(0, eventsPerPage));
          setEvents(processedEvents);
        }
      } else {
        // Just update the last fetched time
        const currentCache = JSON.parse(localStorage.getItem('github_events') || '{}');
        localStorage.setItem('github_events', JSON.stringify({
          ...currentCache,
          lastFetched: Date.now()
        }));
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
      }
    } catch (err) {
      console.error('Failed to fetch new events:', err);
      // Don't clear existing cache on error
    }
  };

  const buildFilterOptionsFromEvents = (events: GitHubEvent[]) => {
    const uniqueRepos = new Set<string>();
    const uniqueActions = new Set<string>();
    const uniqueDescriptions = new Set<string>();

    events.forEach((event) => {
      uniqueRepos.add(event.repo.name);
      uniqueActions.add(event.type.replace('Event', ''));
      
      if (event.payload) {
        if (event.type === 'PushEvent' && event.payload.commits?.length) {
          uniqueDescriptions.add(`Pushed ${event.payload.commits.length} commits`);
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          uniqueDescriptions.add(event.payload.pull_request.title);
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(event.payload.issue.title);
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(`Commented on issue: ${event.payload.issue.title}`);
        }
      }
    });

    setRepositories(Array.from(uniqueRepos).sort());
    setActionTypes(Array.from(uniqueActions).sort());
    setDescriptions(Array.from(uniqueDescriptions).sort());
  };

  const processEvents = (rawEvents: GitHubEvent[]): EventDetails[] => {
    return rawEvents.map((event) => {
      const date = toZonedTime(parseISO(event.created_at), 'America/Los_Angeles');
      const formattedDate = format(date, 'MMM d, yyyy h:mm a');
      
      let action = '';
      let description = '';
      let link = '';
      let detailsMarkdown = '';
      let id = event.id;
      switch (event.type) {
        case 'PushEvent':
          action = 'Push';
          description = `Pushed ${event.payload.commits?.length || 0} commits`;
          link = `https://github.com/${event.repo.name}/commit/${event.payload.head}`;
          break;
        case 'PullRequestEvent':
          action = 'Pull Request';
          description = event.payload.pull_request.title;
          link = event.payload.pull_request.html_url;
          break;
        case 'IssuesEvent':
          action = 'Issue';
          description = event.payload.issue.title;
          link = event.payload.issue.html_url;
          break;
        case 'IssueCommentEvent':
          action = 'Comment';
          description = `Commented on issue: ${event.payload.issue.title}`;
          link = event.payload.comment.html_url;
          break;
        default:
          action = event.type.replace('Event', '');
          description = '';
          link = `https://github.com/${event.repo.name}`;
      }

      return {
        id,
        date: formattedDate,
        repo: event.repo.name,
        action,
        actionType: event.type,
        description,
        link,
        detailsMarkdown,
        payload: event.payload
      };
    });
  };

  const filterEvents = (events: GitHubEvent[]) => {
    return events.filter(event => {
      const matchesRepo = !repoFilter || event.repo.name === repoFilter;
      const matchesAction = !actionFilter || event.type.replace('Event', '') === actionFilter;
      
      let matchesDescription = true;
      if (descriptionFilter) {
        const eventDescription = getEventDescription(event);
        matchesDescription = eventDescription.includes(descriptionFilter);
      }
      
      if (dateFilter) {
        const filterDate = getFilteredDate(dateFilter);
        if (filterDate) {
          const eventDate = new Date(event.created_at);
          if (eventDate < filterDate) return false;
        }
      }
      
      return matchesRepo && matchesAction && matchesDescription;
    });
  };

  const getEventDescription = (event: GitHubEvent): string => {
    if (event.type === 'PushEvent') {
      return `Pushed ${event.payload.commits?.length || 0} commits`;
    } else if (event.type === 'PullRequestEvent') {
      return event.payload.pull_request.title;
    } else if (event.type === 'IssuesEvent') {
      return event.payload.issue.title;
    } else if (event.type === 'IssueCommentEvent') {
      return `Commented on issue: ${event.payload.issue.title}`;
    }
    return '';
  };

  const fetchGitHubEvents = async (pageNum = 1, isFilterChange = false) => {
    // If we have cached data and this is a filter change, use that first
    if (isFilterChange && cachedEvents.length > 0) {
      const filteredCachedEvents = filterEvents(cachedEvents);
      const startIndex = (pageNum - 1) * eventsPerPage;
      const endIndex = startIndex + eventsPerPage;
      const paginatedEvents = filteredCachedEvents.slice(startIndex, endIndex);
      const processedEvents = processEvents(paginatedEvents);
      setEvents(processedEvents);
      setTotalCount(filteredCachedEvents.length);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        per_page: eventsPerPage.toString(),
        ...(repoFilter && { repo: repoFilter }),
        ...(actionFilter && { action: actionFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(descriptionFilter && { description: descriptionFilter })
      });

      const response = await fetch(`/api/github/events?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub events');
      }
      const data = await response.json();
      
      // Add new events to cache if this is page 1
      if (pageNum === 1) {
        const newEvents = [...cachedEvents];
        data.events.forEach((event: GitHubEvent) => {
          if (!newEvents.some(e => e.created_at === event.created_at && e.repo.name === event.repo.name)) {
            newEvents.push(event);
          }
        });
        
        // Update cache
        setCachedEvents(newEvents);
        localStorage.setItem('github_events', JSON.stringify({
          events: newEvents,
          lastFetched: Date.now(),
          totalCount: data.total
        }));

        // Update filter options with new data
        buildFilterOptionsFromEvents(newEvents);
      }
      
      // Process and set current events
      const processedEvents = processEvents(data.events);
      setEvents(processedEvents);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };


  // // Helper function to format the event payload for display
  // const formatEventPayload = (event: EventDetails) => {
  //   const base = {
  //     type: event.actionType,
  //     created_at: event.date,
  //     repo: event.repo,
  //   };

  //   switch (event.actionType) {
  //     case 'PushEvent':
  //       return {
  //         ...base,
  //         commits: event.payload.commits,
  //         ref: event.payload.ref,
  //       };
  //     case 'PullRequestEvent':
  //       return {
  //         ...base,
  //         action: event.payload.action,
  //         title: event.payload.pull_request.title,
  //         number: event.payload.pull_request.number,
  //       };
  //     case 'IssuesEvent':
  //       return {
  //         ...base,
  //         action: event.payload.action,
  //         title: event.payload.issue.title,
  //         number: event.payload.issue.number,
  //       };
  //     case 'DeleteEvent':
  //       return {
  //         ...base,
  //         ref: event.payload.ref,
  //         ref_type: event.payload.ref_type,
  //       };
  //     default:
  //       return base;
  //   }
  // };

  // Filter events based on date
  const getFilteredDate = (filter: string) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      }
      default:
        return null;
    }
  };

  const totalPages = React.useMemo(() => {
    return Math.ceil(totalCount / eventsPerPage);
  }, [totalCount]);

  // Reset page when filters change
  React.useEffect(() => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchGitHubEvents(1, true);
    }
  }, [repoFilter, actionFilter, dateFilter, descriptionFilter]);

  // Fetch when page changes
  React.useEffect(() => {
    fetchGitHubEvents(page, false);
  }, [page]);

  // Initial load
  React.useEffect(() => {
    if (cachedEvents.length === 0) {
      fetchGitHubEvents(1);
    }
  }, [cachedEvents.length]);

  return (
    <Box
      sx={{
        position: 'static',
        top: 98,
        display: 'grid',
        gridTemplateColumns: 'calc((100% - 1152px) / 2) 1fr',
        width: '100%',
        maxWidth: '100%',
        overflowX:' hidden',
        gap: 2
      }}
    >
      <Box></Box>
      <Box sx={{  width: '100%', margin: '0 auto', pl: 4 }}>
        
        <Box sx={{ width: '100%' }} className="master-container">
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight="semiBold">Work</Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Last updated: {lastUpdated}
                </Typography>
              )}
            </Box>
            {totalCount > eventsPerPage && (
              <Pagination 
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: theme.palette.text.secondary,
                    borderColor: theme.palette.divider,
                  }
                }}
              />
            )}
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 0, position: 'relative' }} className="overflow-visible">
            
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Date
                      <FormControl size="small" fullWidth>
                        <Select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          displayEmpty
                          sx={{ '& .MuiSelect-select': { py: 0.5 } }}
                        >
                          <MenuItem value="">All time</MenuItem>
                          <MenuItem value="today">Today</MenuItem>
                          <MenuItem value="yesterday">Yesterday</MenuItem>
                          <MenuItem value="week">Past week</MenuItem>
                          <MenuItem value="month">Past month</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Repository
                      <Autocomplete
                        size="small"
                        options={repositories}
                        value={repoFilter}
                        onChange={(_, newValue) => setRepoFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="All"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                p: '0 8px',
                                '& input': { p: '2.5px 4px' },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            p: 0
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Action
                      <Autocomplete
                        size="small"
                        options={actionTypes}
                        value={actionFilter}
                        onChange={(_, newValue) => setActionFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="All"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                p: '0 8px',
                                '& input': { p: '2.5px 4px' },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            p: 0
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Description
                      <Autocomplete
                        size="small"
                        options={descriptions}
                        value={descriptionFilter}
                        onChange={(_, newValue) => setDescriptionFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Filter descriptions"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                p: '0 8px',
                                '& input': { p: '2.5px 4px' },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            p: 0
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{
                cursor: 'pointer',
                '& tr:hover td': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}>
                {events.map((event, index) => (
                  <TableRow 
                    key={index}
                    id={event.id}
                    sx={{
                      '& td': {
                        backgroundColor: theme.palette.background.paper,
                        transition: 'all 1s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                      },
                      '&.selected td': {
                        backgroundColor: theme.palette.action.selected,
                        transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                      },
                      '&.hover td': {
                        backgroundColor: theme.palette.action.hover,
                        transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                      },
                      '&.selected.hover td': {
                        backgroundColor: theme.palette.action.selected,
                        transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                      }
                    }}
                    onClick={(e: { currentTarget: any; }) => {
                      const newSelectedRow = e.currentTarget;
                      if (newSelectedRow) {
                        if (selectedEvent.id) {
                          const oldSelectedRow = document.getElementById(selectedEvent.id);
                          if (oldSelectedRow) {
                            oldSelectedRow.classList.remove('selected');
                          }
                        }
                        newSelectedRow.classList.add('selected');
                        selectEvent(event);
                      }
                    }}
                    onMouseEnter={(e) => {
                      const closestRow = e.currentTarget;
                      if (closestRow) {
                        
                        closestRow.classList.add('hover');
                      }
                      
                    }}
                    onMouseLeave={(e) => {
                      const closestRow = e.currentTarget;
                      if (closestRow) {
                        closestRow.classList.remove('hover');
                      }
                      
                    }}
                  >
                    <TableCell>{event.date}</TableCell>
                    <TableCell>
                      <a 
                        href={`https://github.com/${event.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                      >
                        {event.repo}
                      </a>
                    </TableCell>
                    <TableCell>{event.action}</TableCell>
                    <TableCell>
                      {event.description !== 'No description available' && (
                        <a 
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                        >
                          {event.description}
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {!hideMetadata && <Box sx={{ position: 'relative', marginRight: 3 }}>
        <Box sx={{ height: 54, left: 0, width: '100%' }}>

        </Box>
        <MetadataDisplay className="event-metadata">
          <ReactJson
            src={selectedEvent}
            name={'selected event'}
            theme={theme.palette.mode === 'dark' ? 'monokai' : 'rjv-default'}
            style={{ background: 'transparent' }}
            displayDataTypes={false}
            enableClipboard={false}
            collapsed={2}
          />
        </MetadataDisplay>
      </Box>}
      </Box>
      
    </Box>
  );
}