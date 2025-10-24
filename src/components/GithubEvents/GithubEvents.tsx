import * as React from 'react';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { format, parse, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { enUS } from 'date-fns/locale';
import { alpha, emphasize, styled, Theme, useTheme } from '@mui/material/styles';
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
import {
  getIndexCache,
  getDetailsCache,
  updateIndexCache,
  addManyEventDetails,
  getEventDetails,
  getIndexPage,
  migrateOldCache,
  clearAllCaches,
  addEventDetails
} from '../../utils/eventCacheManager';

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

// Cache management is now handled by eventCacheManager utility
// which implements a two-tier system:
// - Index cache: 1000 lightweight entries for list display (~200KB)
// - Details cache: 150 full events with LRU eviction (~300KB)
const EVENT_PAGE_SIZE = 20;

export default function GithubEvents({ eventsPerPage = EVENT_PAGE_SIZE, hideMetadata = false, alwaysColumn = false }: { eventsPerPage?: number, hideMetadata?: boolean, alwaysColumn?: boolean }) {
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


  // Helper function to get action name from event type
  const getActionName = (eventType: string): string => {
    switch (eventType) {
      case 'PushEvent':
        return 'Push';
      case 'PullRequestEvent':
        return 'Pull Request';
      case 'IssuesEvent':
        return 'Issue';
      case 'IssueCommentEvent':
        return 'Comment';
      case 'DeleteEvent':
        return 'Delete';
      case 'CreateEvent':
        return 'Create';
      default:
        return eventType.replace('Event', '');
    }
  };

  const actionIcons: Record<string, any> = {
    Issue: <BugReportIcon sx={{ fontSize: 20 }} />,
    Comment: <CommentIcon sx={{ fontSize: 20 }} />,
    Push: <CodeIcon sx={{ fontSize: 20 }} />,
    'Pull Request': <MergeTypeIcon sx={{ fontSize: 20 }} />,
    Delete: <DeleteIcon sx={{ fontSize: 20 }} />,
    Create: <AddBoxIcon sx={{ fontSize: 20 }} />
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
      try {
        localStorage.setItem('github_filters', JSON.stringify({
          repositories: data.repositories,
          actionTypes: data.actionTypes,
          lastFetched: Date.now()
        }));
      } catch (err) {
        console.warn('Failed to cache filters in localStorage:', err);
        // Continue without caching - not critical
      }
    } catch (err) {
      console.error('Failed to fetch filters:', err);
      // Filters will be empty, which is fine - user can still browse events
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
         // Only handle keyboard navigation if the events container or its elements have focus
        // or if a modifier key is pressed (e.g., Shift, Ctrl, Alt)
        const activeElement = document.activeElement;
        const isTableFocused = activeElement?.closest('#events-table-container') !== null ||
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
    if (isMobile && events.length > 0) {
      // Accumulate events for infinite scroll, but limit to prevent memory leak
      // Keep max 200 events (~5 pages) to prevent unbounded memory growth
      const MAX_MOBILE_EVENTS = 200;

      if (page === 1) {
        setAllLoadedEvents(events);
      } else {
        setAllLoadedEvents(prev => {
          // Prevent duplicate events - check if last event in prev matches first in new events
          if (prev.length > 0 && events.length > 0 && prev[prev.length - 1].id === events[0].id) {
            return prev; // Skip duplicate append
          }

          const combined = [...prev, ...events];
          // If we exceed the limit, keep only the most recent events
          if (combined.length > MAX_MOBILE_EVENTS) {
            return combined.slice(combined.length - MAX_MOBILE_EVENTS);
          }
          return combined;
        });
      }
    }
  }, [events, page, isMobile]);

  // Add scroll listener for infinite scroll on mobile
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const container = document.querySelector('#events-table-container');
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when user is 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200 && !loading && page < totalPages) {
        setPage(prev => prev + 1);
      }
    };

    const container = document.querySelector('#events-table-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, loading, page, totalPages]);

  // Helper function to handle event selection
  const handleEventSelection = async (event: DisplayEventDetails, index: number) => {
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

    setSelectedIndex(index);

    // Check if we have details cached
    let details = getEventDetails(event.id);

    if (!details) {
      // Not in cache - show event with loading state first
      selectEvent({ ...event, payload: undefined });

      // Fetch from API
      console.log(`[Details] Event ${event.id} not in cache, fetching from API...`);
      try {
        const response = await fetch(`/api/github/event/${event.id}`);
        if (response.ok) {
          const fullEvent: GitHubEvent = await response.json();
          addEventDetails(fullEvent);
          details = getEventDetails(event.id);
        } else {
          console.error(`[Details] Failed to fetch event: ${response.status}`);
        }
      } catch (err) {
        console.error('[Details] Failed to fetch event details:', err);
      }
    }

    // Update event with full payload
    if (details) {
      const enrichedEvent = {
        ...event,
        payload: details.payload
      };
      selectEvent(enrichedEvent);
    } else {
      selectEvent(event);
    }

    // Update URL with replace and shallow routing to avoid adding to history stack
    // This prevents back button issues and avoids any page reload
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, event: event.id }
    }, undefined, { shallow: true });
  };


  // Load cached data on mount
  React.useEffect(() => {
    // Migrate old cache if it exists
    migrateOldCache();

    // Load index cache
    const indexCache = getIndexCache();
    console.log(`[Cache] Found ${indexCache.events.length} indexed events (v${indexCache.version})`);

    // Check cache version
    if (indexCache.version !== '5.0') {
      console.log('[Cache] Cache version outdated, clearing and fetching fresh data');
      clearAllCaches();
      fetchGitHubEvents(1);
      setIsInitialized(true);
      return;
    }

    // Check if we have enough cached data
    if (indexCache.events.length < eventsPerPage) {
      console.log(`[Cache] Insufficient cached data (${indexCache.events.length} < ${eventsPerPage}), fetching from API`);
      fetchGitHubEvents(1);
      setIsInitialized(true);
      return;
    }

    console.log(`[Cache] Using index cache with ${indexCache.events.length} events`);

    // Load first page from index
    const pageData = getIndexPage(1, eventsPerPage);
    const indexEntries = pageData.entries;

    // Convert index entries to DisplayEventDetails
    const processedEvents: DisplayEventDetails[] = indexEntries.map(entry => {
      const dateTime = toZonedTime(parseISO(entry.created_at), 'America/Chicago');
      return {
        id: entry.id,
        date: format(dateTime, 'MMM d, yyyy h:mm a'),
        dateOnly: format(dateTime, 'MM-dd-yyyy'),
        repo: entry.repo,
        action: getActionName(entry.type),
        actionType: entry.type,
        description: entry.filter_meta.summary,
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
        payload: undefined // Will be loaded on-demand
      };
    });

    setEvents(processedEvents);
    setTotalCount(indexCache.totalCount);

    // Note: Filters are loaded separately via fetchAndCacheFilters in another effect
    // No need to build from index cache since it doesn't have full payload data

    // Format last updated time
    const lastFetchDate = new Date(indexCache.lastFetched);
    setLastUpdated(format(lastFetchDate, 'MMM d, yyyy h:mm a'));
    setLoading(false);

    // Select the first event
    if (processedEvents.length > 0 && !router.query.event) {
      setSelectedIndex(0);
      handleEventSelection(processedEvents[0], 0);
    }

    // Check if we should fetch new events (if it's been more than 1 hour)
    const hoursSinceLastFetch = (Date.now() - indexCache.lastFetched) / (1000 * 60 * 60);
    if (hoursSinceLastFetch >= 1) {
      console.log('[Cache] Cache is stale, refreshing in background');
      fetchNewEvents();
    }

    setIsInitialized(true);
  }, []);

  const fetchNewEvents = async () => {
    try {
      console.log('[Cache] Fetching new events in background');

      // Fetch most recent events
      const response = await fetch(`/api/github/events?page=1&per_page=${EVENT_PAGE_SIZE}`);
      if (!response.ok) throw new Error('Failed to fetch new events');
      const data = await response.json();

      // Update both caches
      updateIndexCache(data.events, data.total);
      addManyEventDetails(data.events);

      setTotalCount(data.total);
      setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));

      console.log(`[Cache] Updated caches with ${data.events.length} new events`);

      // If we're on the first page, refresh the displayed events
      if (page === 1) {
        const pageData = getIndexPage(1, eventsPerPage);
        const processedEvents = pageData.entries.map(entry => {
          const dateTime = toZonedTime(parseISO(entry.created_at), 'America/Chicago');
          return {
            id: entry.id,
            date: format(dateTime, 'MMM d, yyyy h:mm a'),
            dateOnly: format(dateTime, 'MM-dd-yyyy'),
            repo: entry.repo,
            action: getActionName(entry.type),
            actionType: entry.type,
            description: entry.filter_meta.summary,
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
            payload: undefined
          };
        });
        setEvents(processedEvents);
      }
    } catch (err) {
      console.error('[Cache] Failed to fetch new events:', err);
      // Don't clear existing cache on error
    }
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
    // Try using index cache first
    if (useCache) {
      const pageData = getIndexPage(pageNum, eventsPerPage, {
        repo: repoFilter,
        action: actionFilter,
        date: dateFilter,
        description: descriptionFilter
      });

      const indexEntries = pageData.entries;
      const totalFiltered = pageData.totalFiltered;

      // Calculate if this is the last page
      const isLastPage = pageNum === Math.ceil(totalFiltered / eventsPerPage);

      // Use cache if we have a full page OR it's the last page with some results
      const canUseCache =
        indexEntries.length === eventsPerPage ||
        (indexEntries.length > 0 && isLastPage);

      if (canUseCache) {
        console.log(`[Index Cache Hit] Page ${pageNum} (${indexEntries.length} events)`);

        // Convert index entries to DisplayEventDetails
        const processedEvents: DisplayEventDetails[] = indexEntries.map(entry => {
          const dateTime = toZonedTime(parseISO(entry.created_at), 'America/Chicago');
          return {
            id: entry.id,
            date: format(dateTime, 'MMM d, yyyy h:mm a'),
            dateOnly: format(dateTime, 'MM-dd-yyyy'),
            repo: entry.repo,
            action: getActionName(entry.type),
            actionType: entry.type,
            description: entry.filter_meta.summary,
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
            payload: undefined // Will be loaded on-demand
          };
        });

        setEvents(processedEvents);
        setLoading(false);

        // Select the appropriate event on the page
        if (processedEvents.length > 0) {
          const indexToSelect = pageNum === page ? selectedIndex : 0;
          const eventToSelect = processedEvents[Math.min(indexToSelect, processedEvents.length - 1)];
          const actualIndex = processedEvents.findIndex(e => e.id === eventToSelect.id);

          setSelectedIndex(actualIndex);
          handleEventSelection(eventToSelect, actualIndex);
        }
        return;
      }

      console.log(`[Index Cache Miss] Fetching page ${pageNum} from API (cached: ${indexEntries.length}/${eventsPerPage})`);
    }

    // Fetch from API
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

      console.log(`[API] Fetched ${data.events?.length || 0} events for page ${pageNum}`);

      // Update both caches
      updateIndexCache(data.events, data.total);
      addManyEventDetails(data.events);

      // Filters will be updated via the fetchAndCacheFilters effect
      // which runs independently and fetches from /api/github/filters

      // Process and display events
      const processedEvents = processEvents(data.events);
      setEvents(processedEvents);
      setTotalCount(data.total || 0);

      // Select the appropriate event on the page
      if (processedEvents.length > 0) {
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


  // Reset page when filters change
  React.useEffect(() => {
    if (!isInitialized) return; // Don't run on initial mount

    // Clear accumulated events when filters change
    setAllLoadedEvents([]);

    // Check if all filters are cleared
    const allFiltersCleared = !repoFilter && !actionFilter && !dateFilter && !descriptionFilter;

    // Reset to page 1 when filters change
    if (page !== 1) {
      setPage(1);
    } else {
      // If all filters are cleared, try cache first. Otherwise fetch from API
      fetchGitHubEvents(1, allFiltersCleared);
    }
  }, [repoFilter, actionFilter, dateFilter, descriptionFilter]);

  // Fetch when page changes
  React.useEffect(() => {
    if (!isInitialized) return; // Don't run on initial mount

    // Check if we have index cache
    const indexCache = getIndexCache();
    if (indexCache.events.length > 0) {
      fetchGitHubEvents(page, true); // Try cache first
    } else {
      fetchGitHubEvents(page, false); // Fetch from API
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

  const filters = <Box sx={{
    display: 'grid',
    gridTemplateColumns: '100px 1fr 150px',
    gap: 1,
    padding: 1,
    backgroundColor: theme.palette.background.default,
    border: '1px solid ' + theme.palette.divider,
  }}>
    <Box>
      <FormControl size="small" fullWidth>
        <Select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          displayEmpty
          disabled={loading}
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
    <Box>
      <Autocomplete
        size="small"
        options={repositories}
        value={repoFilter}
        onChange={(_, newValue) => setRepoFilter(newValue || '')}
        disabled={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={'Repository'}
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
    <Box>
      <Autocomplete
        size="small"
        options={actionTypes}
        value={actionFilter}
        onChange={(_, newValue) => setActionFilter(newValue || '')}
        disabled={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={'Event Type'}
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
  </Box>

  let latestDateDisplayed: string | null = null;
  return (
    <Box id="github-events" sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      padding: {
        lg: 0,
        sx: alwaysColumn || isMobile ? 0 : '0 10px'
      },
      maxWidth: alwaysColumn ? '100%' : { xs: '100%', lg: isMobile ? '680px' : 'calc(100vw - 20px)'},
      width: alwaysColumn ? '100%' : {sx: '100%', sm: '100%', md: '100%' },
      margin: alwaysColumn ? 0 : '0 10px'
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
            {!isMobile && !alwaysColumn && totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                disabled={loading}
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
        gap: '1px',
        width: '100%',
        border: 0,
      }}>
        <Box
          sx={{
            width: isMobile || alwaysColumn  ? '100%' : '460px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: 0,
            maxHeight: isMobile || alwaysColumn ? '100vh' : 'auto',
          }}
          className="master-container"
        >
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          {/* Filters - fixed position, don't scroll */}
          {!alwaysColumn && filters}

          {/* Scrollable events container */}
          <Box
            id={'events-table-container'}
            sx={{
              borderRadius: '0',
              position: 'relative',
              overflow: 'hidden',
              borderTop: '0px',
              border: 0,
              backgroundColor: theme.palette.background.paper,
              flex: isMobile || alwaysColumn ? '1 1 auto' : 'none',
              minHeight: 0,
              overflowY: isMobile || alwaysColumn ? 'auto' : 'visible',
          }}>
            <Box sx={{
              cursor: 'pointer',
              background: 'rgba(255,255,255,.1)',
              overflowY: 'hidden'
            }}>
              {(isMobile ? allLoadedEvents : events).map((event, index) => {
                const showDateRow = event.dateOnly !== latestDateDisplayed;
                latestDateDisplayed = event.dateOnly;

                return (
                  <React.Fragment key={index}>
                    {showDateRow && (
                      <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 150px',
                        gap: 1,
                        padding: '8px 10px',
                        fontSize: '0.875rem',
                        backgroundColor: theme.palette.mode === 'light' ?
                          'color-mix(in oklab, rgba(0, 97, 194, 0.5) 25%, rgba(235, 235, 235, 0.5))' :
                          'color-mix(in oklab, rgba(102, 179, 255, 0.5) 25%, rgba(31, 31, 31, 0.5))'
                      }}>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Typography variant="subtitle2" fontWeight="semiBold" sx={{ fontSize: '0.875rem' }}>{event.dateOnly}</Typography>
                        </Box>
                      </Box>
                    )}
                    <Box
                      id={event.id}
                      className={selectedEvent.id === event.id ? 'selected' : ''}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 150px',
                        gap: 1,
                        padding: '0px 10px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        backgroundColor: index % 2 === 0
                          ? theme.palette.background.paper
                          : emphasize(theme.palette.background.paper, 0.05),
                        transition: 'all 0.3s ease',
                        border: '1px solid transparent',
                        boxSizing: 'border-box',
                        '&.selected': {
                          backgroundColor: 'hsla(210, 40%, 38%, 1.00)',
                          transition: 'all 0.2s ease',
                          color: '#FFF',
                          borderColor: 'hsla(211, 70%, 75%, 1.00)',
                          ...theme.applyDarkStyles({
                            backgroundColor: 'hsla(210, 40%, 38%, 1.00)',
                          }),
                        },
                        '&:not(.selected):hover': {
                          backgroundColor: theme.palette.primary[50],
                          transition: 'all 0.2s ease',
                          ...theme.applyDarkStyles({
                            backgroundColor: alpha(theme.palette.primary[900], 0.1),
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
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                        {getTimeOnly(event.date)}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', justifyContent: 'center' }}>
                        {event.repo.split('/')[1]}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '38px', fontSize: '0.875rem' }}>
                        {actionIcons[event.action] || null}
                        <span>{event.action}</span>
                      </Box>
                    </Box>
                  </React.Fragment>
                )
              })}
              {(isMobile ? allLoadedEvents : events).length === 0 && !loading && (
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                  No events found
                </Box>
              )}
              {/* Only show inline loading for mobile infinite scroll */}
              {loading && isMobile && (
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                  <CircularProgress size={40} />
                </Box>
              )}
            </Box>
          </Box>
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
              maxWidth: isMobile || alwaysColumn ? '100%' : '680px',
              width: '100%!important',
              marginTop: 0,
              overflow: 'hidden',
            }}>
            <MetadataDisplay
              sx={{
                borderTopRightRadius: theme.shape.borderRadius,
                // Default value for xs and up, then override at lg
                borderTopLeftRadius: {
                  xs: isMobile || alwaysColumn ? theme.shape.borderRadius : 0,  // xs and up (includes sm, md)
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
      {!isMobile && !alwaysColumn && totalPages > 1 && (
        <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            disabled={loading}
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

      {/* Loading spinner centered on page (not component) */}
      {loading && !isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}
    </Box>
  );
}
