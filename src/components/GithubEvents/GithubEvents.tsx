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
import { format, parse, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';
import { alpha, styled, Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Autocomplete from '@mui/material/Autocomplete';
import Pagination from '@mui/material/Pagination';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import PullRequestEvent from './PullRequestEvent';
import PushEvent from './PushEvent';
import DeleteEvent from './DeleteEvent';
import CreateEvent from './CreateEvent';
import IssuesEvent from './IssuesEvent';
import IssueCommentEvent from './IssueCommentEvent';
import { EventDetails, GitHubEvent, CachedData } from '../../types/github';
import { oklab } from 'culori';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CommentIcon from '@mui/icons-material/Comment';
import CodeIcon from '@mui/icons-material/Code';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import BugReportIcon from '@mui/icons-material/BugReport';

// Extend the EventDetails interface for internal component use
interface DisplayEventDetails extends EventDetails {
  dateOnly: string;
}

// Import react-json-view dynamically to avoid SSR issues
const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false,
  loading: () => <div>Loading JSON viewer...</div>
});

const MetadataDisplay = styled(Box)(({ theme }: { theme: Theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  boxShadow: theme.shadows[2],
  padding: theme.spacing(2),
  position: 'sticky',
  maxHeight: 'calc(100vh - 236px - 75px)',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  overflowX: 'hidden'
}));

// Keep only the most recent events in localStorage to prevent quota exceeded errors
// Further reduced to 30 events to avoid localStorage quota issues with large event payloads
const MAX_CACHED_EVENTS = 30;

// Helper function to safely set localStorage with error handling
const safeSetLocalStorage = (key: string, value: any): boolean => {
  try {
    // First, try to estimate the size of what we're storing
    const dataStr = JSON.stringify(value);
    const sizeInBytes = new Blob([dataStr]).size;
    const sizeInKB = sizeInBytes / 1024;

    // If data is too large (> 2MB), reduce the number of cached events
    if (sizeInKB > 2048) {
      console.warn(`Cache data too large (${sizeInKB.toFixed(2)} KB), reducing to 20 events`);
      if (value.events && Array.isArray(value.events)) {
        value.events = value.events.slice(0, 20);
      }
    }

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);

    // If we hit quota, try multiple strategies
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      try {
        // Strategy 1: Clear our own key first
        localStorage.removeItem(key);

        // Strategy 2: Clear old keys that might be from previous versions
        const keysToRemove = ['github_events_cache', 'github_filters', 'github_events_old'];
        keysToRemove.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (e) {
            // Ignore errors when removing keys
          }
        });

        // Strategy 3: If still failing, reduce data to just 10 most recent events
        if (value.events && Array.isArray(value.events)) {
          console.warn('Reducing cache to 10 events due to storage quota');
          value.events = value.events.slice(0, 10);
        }

        // Try one more time with reduced data
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryErr) {
        console.error('Failed to save to localStorage even after cleanup:', retryErr);
        // Last resort: Clear all localStorage for this domain
        try {
          console.warn('Clearing all localStorage due to persistent quota issues');
          localStorage.clear();
          // Try once more after clearing everything
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (finalErr) {
          console.error('Cannot save to localStorage at all:', finalErr);
          return false;
        }
      }
    }
    return false;
  }
};

export default function GithubEvents({ eventsPerPage = 40, hideMetadata = false, alwaysColumn = false }: { eventsPerPage?: number, hideMetadata?: boolean, alwaysColumn?: boolean }) {
  const router = useRouter();
  const [events, setEvents] = React.useState<DisplayEventDetails[]>([]);
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
  const [selectedEvent, selectEvent] = React.useState<DisplayEventDetails>({ id: '' } as DisplayEventDetails);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const theme = useTheme();
  const [isInitialized, setIsInitialized] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showAttached, setShowAttached] = React.useState(false);
  const [scrollTop, setScrollTop] = React.useState(0);
  const pendingEventSelection = React.useRef<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down(900));
  const [allLoadedEvents, setAllLoadedEvents] = React.useState<DisplayEventDetails[]>([]);


  const actionIcons: Record<string, any> = {
    Issue: <BugReportIcon sx={{ fontSize: 18 }} />,
    Comment: <CommentIcon sx={{ fontSize: 18 }} />,
    Push: <CodeIcon sx={{ fontSize: 18 }} />,
    'Pull Request': <MergeTypeIcon sx={{ fontSize: 18 }} />,
    Delete: <DeleteIcon sx={{ fontSize: 18 }} />,
    Create: <AddBoxIcon sx={{ fontSize: 18 }} />
  };

  // Calculate total pages
  const totalPages = React.useMemo(() => {
    const pages = Math.ceil(totalCount / eventsPerPage);
    console.log('[GithubEvents] Pagination debug:', { totalCount, eventsPerPage, totalPages: pages });
    return pages;
  }, [totalCount, eventsPerPage]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollTop(el.scrollTop);
      setShowAttached(true);
      console.log(el.scrollTop);

      // Hide after 1s of inactivity
      clearTimeout((onScroll as any).hideTimeout);
      (onScroll as any).hideTimeout = setTimeout(() => {
        setShowAttached(false);
      }, 1000);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch and cache filter metadata (repositories and event types)
  const fetchAndCacheFilters = async () => {
    try {
      const response = await fetch('/api/github/filters');
      if (!response.ok) throw new Error('Failed to fetch filters');
      const data = await response.json();

      // Update state
      setRepositories(data.repositories);
      setActionTypes(data.actionTypes);

      // Cache in localStorage (separate from events cache)
      safeSetLocalStorage('github_filters', {
        repositories: data.repositories,
        actionTypes: data.actionTypes,
        lastFetched: Date.now()
      });
    } catch (err) {
      console.error('Failed to fetch filters:', err);
      // If fetch fails, build from cached events as fallback
      if (cachedEvents.length > 0) {
        buildFilterOptionsFromEvents(cachedEvents);
      }
    }
  };

  // Load filters from cache or fetch from API
  React.useEffect(() => {
    const cachedFilters = localStorage.getItem('github_filters');
    if (cachedFilters) {
      try {
        const parsedFilters = JSON.parse(cachedFilters);
        setRepositories(parsedFilters.repositories);
        setActionTypes(parsedFilters.actionTypes);

        // Refresh filters in background if cache is older than 1 hour
        const hoursSinceLastFetch = (Date.now() - parsedFilters.lastFetched) / (1000 * 60 * 60);
        if (hoursSinceLastFetch >= 1) {
          fetchAndCacheFilters();
        }
      } catch (err) {
        console.error('Failed to parse cached filters:', err);
        fetchAndCacheFilters();
      }
    } else {
      fetchAndCacheFilters();
    }
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!events.length) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
         // Only handle keyboard navigation if the table or its elements have focus
        // or if a modifier key is pressed (e.g., Shift, Ctrl, Alt)
        const activeElement = document.activeElement;
        const isTableFocused = activeElement?.closest('.MuiTableContainer-root') !== null ||
                              activeElement?.closest('tbody') !== null ||
                              e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;

        // If table is not focused and no modifier keys, allow normal scrolling
        if (!isTableFocused) {
          return;
        }
        
        e.preventDefault();

        let newIndex = selectedIndex;

        if (e.key === 'ArrowDown') {
          newIndex = selectedIndex + 1;

          // Check if we need to go to the next page
          if (newIndex >= events.length) {
            if (page < totalPages) {
              setPage(page + 1);
              setSelectedIndex(0); // Will select first item of next page
            }
            return;
          }
        } else if (e.key === 'ArrowUp') {
          newIndex = selectedIndex - 1;

          // Check if we need to go to the previous page
          if (newIndex < 0) {
            if (page > 1) {
              setPage(page - 1);
              setSelectedIndex(eventsPerPage - 1); // Will select last item of previous page
            }
            return;
          }
        }

        // Update selection within current page
        if (newIndex >= 0 && newIndex < events.length) {
          setSelectedIndex(newIndex);
          const event = events[newIndex];
          handleEventSelection(event, newIndex);

          // Scroll the selected row into view
          const selectedRow = document.getElementById(event.id);
          if (selectedRow) {
            selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [events, selectedIndex, page, totalPages]);

  // Handle URL query parameters for direct links - only on initial load
  React.useEffect(() => {
    if (!router.isReady) return;

    // Only process URL parameter on initial mount, not on every query change
    const { event: eventId } = router.query;

    // Use a ref to track if we've already processed the initial URL
    if (eventId && typeof eventId === 'string' && !isInitialized && cachedEvents.length > 0) {
      // Search in all cached events (applying current filters)
      const allFilteredEvents = filterEvents(cachedEvents);
      const globalEventIndex = allFilteredEvents.findIndex(e => e.id === eventId);

      if (globalEventIndex !== -1) {
        // Calculate which page this event is on
        const targetPage = Math.floor(globalEventIndex / eventsPerPage) + 1;

        if (targetPage !== page) {
          // Store the event ID to select after page loads
          pendingEventSelection.current = eventId;
          // Navigate to the correct page
          setPage(targetPage);
        } else {
          // Event is on current page, select it immediately
          const currentPageIndex = events.findIndex(e => e.id === eventId);
          if (currentPageIndex !== -1) {
            const event = events[currentPageIndex];
            setSelectedIndex(currentPageIndex);
            selectEvent(event);

            // Mark the row as selected visually
            setTimeout(() => {
              const selectedRow = document.getElementById(eventId);
              if (selectedRow) {
                selectedRow.classList.add('selected');
                selectedRow.scrollIntoView({ behavior: 'auto', block: 'nearest' });
              }
            }, 100);
          }
        }
      }
    }
  }, [router.isReady, cachedEvents.length, eventsPerPage, isInitialized, page]); // Only depend on necessary values

  // Handle pending event selection after page change
  React.useEffect(() => {
    if (pendingEventSelection.current && events.length > 0) {
      const eventId = pendingEventSelection.current;
      const eventIndex = events.findIndex(e => e.id === eventId);

      if (eventIndex !== -1) {
        const event = events[eventIndex];
        setSelectedIndex(eventIndex);
        selectEvent(event);

        // Mark the row as selected visually
        setTimeout(() => {
          const selectedRow = document.getElementById(eventId);
          if (selectedRow) {
            selectedRow.classList.add('selected');
            selectedRow.scrollIntoView({ behavior: 'auto', block: 'nearest' });
          }
        }, 100);

        // Clear the pending selection
        pendingEventSelection.current = null;
      }
    }
  }, [events]); // Run whenever events change

  // Handle infinite scroll for mobile
  React.useEffect(() => {
    if (isMobile) {
      // Accumulate events for infinite scroll
      if (page === 1) {
        setAllLoadedEvents(events);
      } else {
        setAllLoadedEvents(prev => [...prev, ...events]);
      }
    }
  }, [events, page, isMobile]);

  // Add scroll listener for infinite scroll on mobile
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const container = document.querySelector('.master-container');
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when user is 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200 && !loading && page < totalPages) {
        setPage(prev => prev + 1);
      }
    };

    const container = document.querySelector('.master-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, loading, page, totalPages]);

  // Helper function to handle event selection
  const handleEventSelection = (event: DisplayEventDetails, index: number) => {
    // Remove previous selection
    if (selectedEvent.id) {
      const oldSelectedRow = document.getElementById(selectedEvent.id);
      if (oldSelectedRow) {
        oldSelectedRow.classList.remove('selected');
      }
    }

    // Add new selection
    const newSelectedRow = document.getElementById(event.id);
    if (newSelectedRow) {
      newSelectedRow.classList.add('selected');
    }

    selectEvent(event);
    setSelectedIndex(index);

    // Update URL with replace and shallow routing to avoid adding to history stack
    // This prevents back button issues and avoids any page reload
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, event: event.id }
    }, undefined, { shallow: true });
  };


  // Load cached data on mount
  React.useEffect(() => {
    const cached = localStorage.getItem('github_events');
    if (cached) {
      try {
        const parsedCache: CachedData = JSON.parse(cached);

        // Check if cache version is outdated - force refresh if structure changed
        const cacheVersion = (parsedCache as any).version;
        if (cacheVersion !== '4.0') {
          console.log('Cache version outdated, clearing and fetching fresh data');
          localStorage.removeItem('github_events');
          fetchGitHubEvents(1);
          setIsInitialized(true);
          return;
        }

        setCachedEvents(parsedCache.events);
        setTotalCount(parsedCache.totalCount);
        buildFilterOptionsFromEvents(parsedCache.events);

        // Format last updated time
        const lastFetchDate = new Date(parsedCache.lastFetched);
        setLastUpdated(format(lastFetchDate, 'MMM d, yyyy h:mm a'));

        // Check if cache has enough events for the current eventsPerPage requirement
        const filteredEvents = parsedCache.events;
        if (filteredEvents.length >= eventsPerPage) {
          // We have enough cached data, display it immediately
          const processedEvents = processEvents(filteredEvents.slice(0, eventsPerPage));
          setEvents(processedEvents);
          setLoading(false);

          // Select the first event
          if (processedEvents.length > 0 && !router.query.event) {
            setSelectedIndex(0);
            handleEventSelection(processedEvents[0], 0);
          }

          // Check if we should fetch new events (if it's been more than 1 hour)
          const hoursSinceLastFetch = (Date.now() - parsedCache.lastFetched) / (1000 * 60 * 60);
          if (hoursSinceLastFetch >= 1) {
            fetchNewEvents();
          }
        } else if (filteredEvents.length > 0 && parsedCache.totalCount > filteredEvents.length) {
          // We have some cached data but not enough - fetch the missing events
          // Display cached data first
          const processedEvents = processEvents(filteredEvents);
          setEvents(processedEvents);
          setLoading(false);

          // Select the first event
          if (processedEvents.length > 0 && !router.query.event) {
            setSelectedIndex(0);
            handleEventSelection(processedEvents[0], 0);
          }

          // Fetch the remaining events we need in the background
          fetchGitHubEvents(1);
        } else {
          // Cache doesn't have enough data, fetch from API
          fetchGitHubEvents(1);
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to parse cached events:', err);
        localStorage.removeItem('github_events');
        fetchGitHubEvents(1);
        setIsInitialized(true);
      }
    } else {
      fetchGitHubEvents(1);
      setIsInitialized(true);
    }
  }, []);

  const fetchNewEvents = async () => {
    try {
      // First, get the most recent event date from our cache
      let mostRecentDate = new Date(0);
      if (cachedEvents.length > 0) {
        mostRecentDate = new Date(Math.max(...cachedEvents.map(e => new Date(e.created_at).getTime())));
      }

      // Only fetch the most recent events to check for updates (not 100!)
      const response = await fetch('/api/github/events?page=1&per_page=20');
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

        // Prune old events to keep localStorage size manageable
        const prunedEvents = pruneOldEvents(newEvents);

        // Update cache with pruned events but keep the TOTAL count from MongoDB
        setCachedEvents(prunedEvents);
        safeSetLocalStorage('github_events', {
          version: '4.0',
          events: prunedEvents,
          lastFetched: Date.now(),
          totalCount: data.total  // Use total from MongoDB, not pruned cache size
        });

        // Update UI (use prunedEvents for filters, but data.total for pagination)
        buildFilterOptionsFromEvents(prunedEvents);
        setTotalCount(data.total);  // Use total from MongoDB for accurate pagination
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));

        // If we're on the first page, update the displayed events
        if (page === 1) {
          const filteredEvents = filterEvents(prunedEvents);
          const processedEvents = processEvents(filteredEvents.slice(0, eventsPerPage));
          setEvents(processedEvents);
        }
      } else {
        // Just update the last fetched time
        const currentCache = JSON.parse(localStorage.getItem('github_events') || '{}');
        safeSetLocalStorage('github_events', {
          ...currentCache,
          version: '4.0',
          lastFetched: Date.now()
        });
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
      }
    } catch (err) {
      console.error('Failed to fetch new events:', err);
      // Don't clear existing cache on error
    }
  };

  // Helper function to prune old events from cache
  const pruneOldEvents = (events: GitHubEvent[]): GitHubEvent[] => {
    if (events.length <= MAX_CACHED_EVENTS) {
      return events;
    }

    // Sort by date (newest first) and keep only the most recent MAX_CACHED_EVENTS
    const sorted = [...events].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const pruned = sorted.slice(0, MAX_CACHED_EVENTS);
    console.log(`Pruned cache from ${events.length} to ${pruned.length} events`);
    return pruned;
  };

  const buildFilterOptionsFromEvents = (events: GitHubEvent[]) => {
    const uniqueRepos = new Set<string>();
    const uniqueActions = new Set<string>();
    const uniqueDescriptions = new Set<string>();

    events.forEach((event) => {
      // Strip username from repo name (e.g., "username/repo" -> "repo")
      const repoName = event.repo.name.split('/')[1] || event.repo.name;
      uniqueRepos.add(repoName);
      uniqueActions.add(event.type.replace('Event', ''));

      if (event.payload) {
        if (event.type === 'PushEvent') {
          const commitCount = event.payload.commits ? event.payload.commits.length : (event.payload.size || 0);
          uniqueDescriptions.add(`Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`);
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          uniqueDescriptions.add(event.payload.pull_request.title);
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(event.payload.issue.title);
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(`Commented on issue: ${event.payload.issue.title}`);
        }
      }
    });

    const newRepos = Array.from(uniqueRepos).sort();
    const newActions = Array.from(uniqueActions).sort();

    // Check if we found any new repos or event types not in the cached filters
    const cachedFilters = localStorage.getItem('github_filters');
    if (cachedFilters) {
      try {
        const parsedFilters = JSON.parse(cachedFilters);
        const hasNewRepos = newRepos.some(repo => !parsedFilters.repositories.includes(repo));
        const hasNewActions = newActions.some(action => !parsedFilters.actionTypes.includes(action));

        // If we found new repos or actions, update the filter cache
        if (hasNewRepos || hasNewActions) {
          const updatedRepos = Array.from(new Set([...parsedFilters.repositories, ...newRepos])).sort();
          const updatedActions = Array.from(new Set([...parsedFilters.actionTypes, ...newActions])).sort();

          safeSetLocalStorage('github_filters', {
            repositories: updatedRepos,
            actionTypes: updatedActions,
            lastFetched: parsedFilters.lastFetched // Keep original fetch time
          });

          setRepositories(updatedRepos);
          setActionTypes(updatedActions);
        }
      } catch (err) {
        console.error('Failed to update filter cache:', err);
      }
    }

    setDescriptions(Array.from(uniqueDescriptions).sort());
  };

  const processEvents = (rawEvents: GitHubEvent[]): DisplayEventDetails[] => {
    return rawEvents.map((event) => {
      const dateTime = toZonedTime(parseISO(event.created_at), 'America/Chicago');
      const date = format(dateTime, 'MM-dd-yyyy');
      
      const formattedDate = format(dateTime, 'MMM d, yyyy h:mm a');
      
      const eventDetails: DisplayEventDetails = {
        id: event.id,
        date: formattedDate,
        dateOnly: date,
        repo: event.repo.name,
        action: '',
        actionType: event.type,
        description: '',
        url: '',
        state: 'open',
        user: '',
        avatarUrl: '',
        number: 0,
        merged: false,
        comments: 0,
        commits: 0,
        ref: '',
        commitsList: [],
        payload: event.payload
      };

      let action = '';
      let description = '';
      let link = '';

      switch (event.type) {
        case 'PushEvent':
          action = 'Push';
          const commitCount = event.payload?.commits ? event.payload.commits.length : (event.payload?.size || 0);
          description = `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
          if (commitCount > 1) {
            link = `https://github.com/${event.repo.name}/compare/${event.payload.before}...${event.payload.head}`;
          } else {
            link = `https://github.com/${event.repo.name}/commit/${event.payload.head}`;
          }
          eventDetails.commitsList = event.payload.commits
            ? event.payload.commits.map((commit: any) => {
                const normalizedMessage =
                  commit.message ||
                  commit.commit?.message ||
                  commit.payload?.commit?.message ||
                  '';
                const message = normalizedMessage || 'No commit message provided';
                const authorName =
                  commit.author?.name ||
                  commit.commit?.author?.name ||
                  commit.commit?.author?.email ||
                  commit.commit?.committer?.name ||
                  'Unknown author';

                return {
                  message,
                  sha: commit.sha,
                  author: {
                    name: authorName,
                  },
                  html_url: commit.html_url || `https://github.com/${event.repo.name}/commit/${commit.sha}`,
                };
              })
            : [];
          eventDetails.ref = event.payload.ref;
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
      
      eventDetails.action = action;
      eventDetails.description = description;
      eventDetails.url = link;

      return eventDetails;
    });
  };

  const filterEvents = (events: GitHubEvent[]) => {
    return events.filter(event => {
      // Compare just the repo name without username
      const repoName = event.repo.name.split('/')[1] || event.repo.name;
      const matchesRepo = !repoFilter || repoName === repoFilter;
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
      const commitCount = event.payload?.commits ? event.payload.commits.length : (event.payload?.size || 0);
      return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`;
    } else if (event.type === 'PullRequestEvent') {
      return event.payload.pull_request.title;
    } else if (event.type === 'IssuesEvent') {
      return event.payload.issue.title;
    } else if (event.type === 'IssueCommentEvent') {
      return `Commented on issue: ${event.payload.issue.title}`;
    }
    return '';
  };

  const fetchGitHubEvents = async (pageNum = 1, useCache = false) => {
    // If we should use cache and have cached data
    if (useCache && cachedEvents.length > 0) {
      const filteredCachedEvents = filterEvents(cachedEvents);
      const startIndex = (pageNum - 1) * eventsPerPage;
      const endIndex = startIndex + eventsPerPage;
      const paginatedEvents = filteredCachedEvents.slice(startIndex, endIndex);

      // If we have enough cached data for this page, use it
      if (paginatedEvents.length === eventsPerPage) {
        const processedEvents = processEvents(paginatedEvents);
        setEvents(processedEvents);
        setLoading(false);

        // Select the appropriate event on the page
        if (processedEvents.length > 0) {
          // Use selectedIndex if it's been set (e.g., from keyboard nav)
          const indexToSelect = pageNum === page ? selectedIndex : 0;
          const eventToSelect = processedEvents[Math.min(indexToSelect, processedEvents.length - 1)];
          const actualIndex = processedEvents.findIndex(e => e.id === eventToSelect.id);

          setSelectedIndex(actualIndex);
          handleEventSelection(eventToSelect, actualIndex);
        }
        return;
      }
      // If we don't have enough cached data, fall through to fetch more
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

      // Add new events to cache
      const newEvents = [...cachedEvents];
      data.events.forEach((event: GitHubEvent) => {
        if (!newEvents.some(e => e.id === event.id)) {
          newEvents.push(event);
        }
      });

      // Sort by date (newest first)
      newEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Prune to keep cache size manageable (keep most recent MAX_CACHED_EVENTS)
      const prunedEvents = pruneOldEvents(newEvents);

      // Update cache
      setCachedEvents(prunedEvents);
      safeSetLocalStorage('github_events', {
        version: '4.0',
        events: prunedEvents,
        lastFetched: Date.now(),
        totalCount: data.total
      });

      // Update filter options with all cached data
      buildFilterOptionsFromEvents(prunedEvents);

      // Process and set current events
      console.log('[GithubEvents] API response:', {
        totalFromAPI: data.total,
        eventsCount: data.events?.length,
        page: pageNum
      });
      const processedEvents = processEvents(data.events);
      setEvents(processedEvents);
      setTotalCount(data.total || 0);

      // Select the appropriate event on the page
      if (processedEvents.length > 0) {
        // Use selectedIndex if it's been set (e.g., from keyboard nav)
        const indexToSelect = pageNum === page ? selectedIndex : 0;
        const eventToSelect = processedEvents[Math.min(indexToSelect, processedEvents.length - 1)];
        const actualIndex = processedEvents.findIndex(e => e.id === eventToSelect.id);

        if (!selectedEvent.id || pageNum !== page) {
          setSelectedIndex(actualIndex);
          handleEventSelection(eventToSelect, actualIndex);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('rate limit') || errorMessage.includes('403')) {
        setError('GitHub API rate limit exceeded. The data will refresh automatically when the limit resets. Using cached data if available.');
      } else {
        setError(errorMessage);
      }
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

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


  // Reset page when filters change and always fetch from API
  React.useEffect(() => {
    if (!isInitialized) return; // Don't run on initial mount

    // Always fetch from API when filters change because we can't know
    // what data is not in localStorage cache
    if (page !== 1) {
      setPage(1);
    } else {
      fetchGitHubEvents(1, false); // false = don't use cache, always fetch from API
    }
  }, [repoFilter, actionFilter, dateFilter, descriptionFilter]);

  // Fetch when page changes
  React.useEffect(() => {
    if (!isInitialized) return; // Don't run on initial mount

    // Use cached data for pagination if available
    if (cachedEvents.length > 0) {
      fetchGitHubEvents(page, true);
    } else {
      fetchGitHubEvents(page, false);
    }
  }, [page]);

  // Select first event when events change (e.g., after page navigation)
  React.useEffect(() => {
    if (events.length > 0 && selectedIndex === 0) {
      // This ensures the first event is selected when navigating pages
      const firstEvent = events[0];
      if (firstEvent.id !== selectedEvent.id) {
        handleEventSelection(firstEvent, 0);
      }
    }
  }, [events]);

  const getTimeOnly = (date: string) => {
    const parsed = parse(date, 'MMM d, yyyy h:mm a', new Date());
    return format(parsed, 'h:mm a');
  }
  
  const filters = <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(!isMobile && !alwaysColumn) ? 'Date' : null}
                      <FormControl size="small" fullWidth>
                        <Select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          displayEmpty
                          sx={{
                            '& .MuiSelect-select': {
                              py: 0.5,
                              fontSize: '0.875rem'
                            },
                            '& .MuiInputBase-root': {
                              height: '32px',
                              minHeight: '32px'
                            }
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '0.875rem' }}>All time</MenuItem>
                          <MenuItem value="today" sx={{ fontSize: '0.875rem' }}>Today</MenuItem>
                          <MenuItem value="yesterday" sx={{ fontSize: '0.875rem' }}>Yesterday</MenuItem>
                          <MenuItem value="week" sx={{ fontSize: '0.875rem' }}>Past week</MenuItem>
                          <MenuItem value="month" sx={{ fontSize: '0.875rem' }}>Past month</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {(!isMobile && !alwaysColumn) ? 'Repository' : null}
                      <Autocomplete
                        size="small"
                        options={repositories}
                        value={repoFilter}
                        onChange={(_, newValue) => setRepoFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={isMobile || alwaysColumn ? 'Repository' : 'All'}
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                p: '0 8px',
                                fontSize: '0.875rem',
                                '& input': {
                                  p: '2.5px 4px',
                                  fontSize: '0.875rem'
                                 },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        slotProps={{
                          popper: {
                            placement: 'bottom-start',
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 4],
                                },
                              },
                            ],
                            sx: {
                              '& .MuiPaper-root': {
                                width: 'fit-content !important',
                                minWidth: '100%',
                              },
                              '& .MuiAutocomplete-listbox': {
                                fontSize: '0.875rem',
                                padding: '4px',
                                '& .MuiAutocomplete-option': {
                                  fontSize: '0.875rem',
                                  minHeight: '32px',
                                  whiteSpace: 'nowrap',
                                  padding: '6px 12px'
                                }
                              }
                            }
                          }
                        }}
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {(!isMobile && !alwaysColumn) ? 'Type' : null}
                      <Autocomplete
                        size="small"
                        options={actionTypes}
                        value={actionFilter}
                        onChange={(_, newValue) => setActionFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={isMobile || alwaysColumn ? 'Event Type' : 'All'}
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                p: '0 8px',
                                fontSize: '0.875rem',
                                '& input': {
                                  p: '2.5px 4px',
                                  fontSize: '0.875rem'
                                },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        slotProps={{
                          popper: {
                            placement: 'bottom-start',
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 4],
                                },
                              },
                            ],
                            sx: {
                              '& .MuiPaper-root': {
                                width: 'fit-content !important',
                                minWidth: '100%',
                              },
                              '& .MuiAutocomplete-listbox': {
                                fontSize: '0.875rem',
                                padding: '4px',
                                borderRadius: '0',
                                '& .MuiAutocomplete-option': {
                                  fontSize: '0.875rem',
                                  minHeight: '32px',
                                  whiteSpace: 'nowrap',
                                  padding: '6px 12px'
                                }
                              }
                            }
                          }
                        }}
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

  let latestDateDisplayed: string | null = null;
  return (
    <Box id="github-events" className={alwaysColumn || isMobile  ? 'w-full' : 'w-[1144px]'} sx={{
       display: 'flex',
        flexDirection: 'column',
        gap: 1,
        // margin: {
        //   lg: 0, 
        //   md: '0 10px'
        // },
        maxWidth: { xs: '100%', lg: alwaysColumn || isMobile ? '680px' : 'calc(100vw - 20px)'},
      
    }}>
      {!alwaysColumn && <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 0,
          flexDirection: 'column',
       
        }}>
          <Typography variant="subtitle1" fontWeight="semiBold">Work</Typography>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated}
            </Typography>
          )}
        </Box>
        {totalCount > 0 && (
          <Box sx={{
            display: 'flex', 
            alignItems: { 
              xs: undefined, 
              lg: 'center'
            }, 
            alignSelf: { 
              xs: 'end', 
              lg: undefined 
            }, 
            gap: 0,
            
          }}>
            <Typography variant="caption" color="text.secondary">
              {totalCount} total events
            </Typography>
            {!isMobile && !alwaysColumn && totalPages > 0 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: theme.palette.text.secondary,
                    borderColor: 'hsl(210deg 12.42% 36.87%)',
                  }
                }}
              />
            )}
          </Box>
        )}
      </Box> }
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile || alwaysColumn ? 'column-reverse' : 'row',
        gap: 0,
        width: '100%',
        border: 0,
      }}>
        <Box
          sx={{
            width: isMobile || alwaysColumn  ? '100%' : '460px',
            flexShrink: 0,
            display: 'block',
            position: 'relative',
            maxHeight: isMobile || alwaysColumn  ? '50vh' : 'auto',
            overflowY: 'visible',
            border: 0,
          }}
          className="master-container">
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <TableContainer component={Paper} 
            sx={{ 
              mb: 4, 
              borderRadius: '0', 
              position: 'relative', 
              overflow: 'visible',
              borderTop: '0px',
              border: 0
            }}>
            <Table 
              size="small"
            >
              {!alwaysColumn && <TableHead>
                {filters}
              </TableHead>}
              <TableBody sx={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,.1)',
                '& tr:hover td': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}>
                {(isMobile ? allLoadedEvents : events).map((event, index) => {
                    const showDateRow = event.dateOnly !== latestDateDisplayed;
                    latestDateDisplayed = event.dateOnly;

                    return (
                      <React.Fragment key={index}>
                      {showDateRow && <TableRow style={{ 
                        backgroundColor: theme.palette.mode === 'light' ?
                          'color-mix(in oklab, rgba(0, 97, 194, 0.5) 25%, rgba(235, 235, 235, 0.5))' : 
                          'color-mix(in oklab, rgba(102, 179, 255, 0.5) 25%, rgba(31, 31, 31, 0.5))'
                        }}>
                        <TableCell colSpan={4} >
                          <Typography variant="subtitle2" fontWeight="semiBold">{event.dateOnly}</Typography>
                          </TableCell>
                        </TableRow>}
                      <TableRow
                        key={index}
                        id={event.id}
                        sx={{
                          cursor: 'pointer',
                         
                          '& td': {
                            backgroundColor: theme.palette.background.paper,
                            transition: 'all 0.3s ease',
                          },
                          '&.selected': {
                            '& td': {
                              backgroundColor: 'hsla(210, 16%, 55%, 0.40)',
                              transition: 'all 0.2s ease',
                              color: '#FFF',
                              position: 'relative',
                            },
                            '& td:first-of-type': {
                              borderLeft: '1px solid hsla(211, 70%, 75%, 1.00)',
                              borderTop: '1px solid hsla(211, 70%, 75%, 1.00)',
                              borderBottom: '1px solid hsla(211, 70%, 75%, 1.00)',
                            },
                            '& td:last-of-type': {
                              borderRight: '1px solid hsla(211, 70%, 75%, 1.00)',
                              borderTop: '1px solid hsla(211, 70%, 75%, 1.00)',
                              borderBottom: '1px solid hsla(211, 70%, 75%, 1.00)',
                            },
                            '& td:not(:first-of-type):not(:last-of-type)': {
                              borderTop: '1px solid hsla(211, 70%, 75%, 1.00)',
                              borderBottom: '1px solid hsla(211, 70%, 75%, 1.00)',
                            },
                            ...theme.applyDarkStyles({
                              '& td': {
                                backgroundColor: 'hsla(210, 40%, 38%, 1.00)',
                                transition: 'all 0.2s ease',
                                color: '#FFF',
                              },
                            }),
                          },
                          '&:not(.selected):hover': {
                            '& td': {
                              backgroundColor: theme.palette.primary[50],
                              transition: 'all 0.2s ease',
                            },
                            ...theme.applyDarkStyles({
                              '& td': {
                                backgroundColor: alpha(theme.palette.primary[900], 0.1),
                              },
                            }),
                          },
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const eventIndex = events.findIndex(evt => evt.id === event.id);
                          if (eventIndex !== -1) {
                            handleEventSelection(event, eventIndex);
                          }
                        }}
                      >
                        <TableCell>{getTimeOnly(event.date)}</TableCell>
                        <TableCell>
                          {event.repo.split('/')[1]}
                        </TableCell>
                        <TableCell sx={{ height: '38px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {actionIcons[event.action] || null}
                            <span>{event.action}</span>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  )
                })}
                {(isMobile ? allLoadedEvents : events).length === 0 && !loading && (
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
        {!selectedEvent.id && (
          <Box
            id="detail-pane-temp"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              opacity: 0.3
            }}>
            <MetadataDisplay>
              <PullRequestEvent event={selectedEvent} />
            </MetadataDisplay>
          </Box>
        )}
        {selectedEvent.id && (
          <Box
            id="detail-pane"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: isMobile || alwaysColumn ? 'auto' : '100%',
              position: 'relative',
              maxHeight: isMobile || alwaysColumn ? '50vh' : 'calc(100vh - 236px - 75px)',
              maxWidth: isMobile || alwaysColumn  ? '100%' : '680px',
              width: '100%!important',
              marginRight: isMobile || alwaysColumn ? 0 : '10px',
              marginTop: 0,
              overflow: 'hidden',
              borderRadius: '14px 14px 0px 0',
            }}>
            <MetadataDisplay
              sx={{
                borderTopRightRadius: theme.shape.borderRadius,
                // Default value for xs and up, then override at lg
                borderTopLeftRadius: {
                  xs: theme.shape.borderRadius,  // xs and up (includes sm, md)
                  lg: alwaysColumn ? theme.shape.borderRadius : 0                          // lg and up (includes xl)
                },
                // Default value for xs and up, then override at lg
                borderBottomRightRadius: {
                  xs: 0,                          // xs and up (includes sm, md)
                  lg: alwaysColumn ? 0 : theme.shape.borderRadius   // lg and up (includes xl)
                },
              }}>
              {selectedEvent.actionType === 'PullRequestEvent' ? (
                <PullRequestEvent event={selectedEvent} />
              ) : selectedEvent.actionType === 'PushEvent' ? (
                <PushEvent event={selectedEvent} />
              ) : selectedEvent.actionType === 'DeleteEvent' ? (
                <DeleteEvent event={selectedEvent} />
              ) : selectedEvent.actionType === 'CreateEvent' ? (
                <CreateEvent event={selectedEvent} />
              ) : selectedEvent.actionType === 'IssuesEvent' ? (
                <IssuesEvent event={selectedEvent} />
              ) : selectedEvent.actionType === 'IssueCommentEvent' ? (
                <IssueCommentEvent event={selectedEvent} />
              ) : (
              <ReactJson
                src={selectedEvent}
                name={false}
                theme="monokai"
                displayDataTypes={false}
                enableClipboard={false}
                displayObjectSize={false}
                collapsed={1}
                collapseStringsAfterLength={50}
                style={{
                  backgroundColor: 'red',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: 'calc(100vh - 200px)'
                }}
              />)}
            </MetadataDisplay>
          </Box>
        )}
      </Box>

      {/* Bottom Pagination - hide on mobile since we use infinite scroll */}
      {!isMobile && !alwaysColumn && totalCount > 0 && totalPages > 1 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.secondary,
                borderColor: 'hsl(210deg 12.42% 36.87%)',
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}
