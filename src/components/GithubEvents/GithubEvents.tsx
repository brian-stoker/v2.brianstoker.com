import * as React from 'react';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { format, formatDistanceToNow, parse, parseISO } from 'date-fns';
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
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
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
import { replaceGithubEmoji } from '../../utils/githubEmoji';

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
  const [repoStats, setRepoStats] = React.useState<Record<string, { count: number, lastEventDate: string, recentTypes: string[] }>>({});
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
  // Group events by repo for mobile repo strip - uses ALL repos from filters API
  // Sorted by most recent event, with accurate total counts from DB
  const mobileRepoGroups = React.useMemo(() => {
    const groups = repositories.map(repoName => {
      const shortName = repoName.split('/')[1] || repoName;
      const stats = repoStats[repoName];
      return {
        name: repoName,
        shortName,
        totalCount: stats?.count || 0,
        lastEventDate: stats?.lastEventDate || '',
        recentTypes: stats?.recentTypes || [],
      };
    });
    // Sort by most recent event date (from DB stats)
    return groups.sort((a, b) => {
      if (a.lastEventDate && b.lastEventDate) {
        return b.lastEventDate.localeCompare(a.lastEventDate);
      }
      if (a.lastEventDate) return -1;
      if (b.lastEventDate) return 1;
      return a.shortName.localeCompare(b.shortName);
    });
  }, [repositories, repoStats]);

  // Events for mobile view - API handles repo filtering via repoFilter
  const mobileFilteredEvents = React.useMemo(() => {
    return isMobile ? allLoadedEvents : events;
  }, [isMobile, allLoadedEvents, events]);

  // Global total across all repos (from DB stats, not filtered page count)
  const globalTotalEvents = React.useMemo(() => {
    const statsTotal = Object.values(repoStats).reduce((sum, s) => sum + s.count, 0);
    return statsTotal || totalCount;
  }, [repoStats, totalCount]);

  // Event type colors (matching Magic Patterns design)
  const getEventColor = (actionType: string): string => {
    switch (actionType) {
      case 'PushEvent': return '#58a6ff';        // Blue
      case 'PullRequestEvent': return '#a371f7';  // Purple
      case 'IssuesEvent': return '#3fb950';        // Green
      case 'IssueCommentEvent': return '#3fb950';  // Green
      case 'CreateEvent': return '#d29922';        // Orange
      case 'DeleteEvent': return '#f85149';        // Red
      default: return '#8b949e';
    }
  };


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

  // Sync totalCount with authoritative DB total when no filters are active
  // The filters API returns fresh per-repo counts from the DB, while totalCount
  // may be stale from the localStorage index cache
  React.useEffect(() => {
    const hasFilters = repoFilter || actionFilter || dateFilter || descriptionFilter;
    if (!hasFilters && globalTotalEvents > 0 && globalTotalEvents !== totalCount) {
      setTotalCount(globalTotalEvents);
    }
  }, [globalTotalEvents, repoFilter, actionFilter, dateFilter, descriptionFilter]);

  // Calculate total pages
  const totalPages = React.useMemo(() => {
    const pages = Math.ceil(totalCount / eventsPerPage);
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
      if (!response.ok) {
        console.warn('Failed to fetch filters:', response.status);
        return;
      }
      const data = await response.json();

      // Update state
      setRepositories(data.repositories);
      setActionTypes(data.actionTypes);
      if (data.repositoryStats) {
        const statsMap: Record<string, { count: number, lastEventDate: string, recentTypes: string[] }> = {};
        data.repositoryStats.forEach((r: { name: string, count: number, lastEventDate: string, recentTypes?: string[] }) => {
          statsMap[r.name] = { count: r.count, lastEventDate: r.lastEventDate, recentTypes: r.recentTypes || [] };
        });
        setRepoStats(statsMap);
      }

      // Cache in localStorage (separate from events cache)
      try {
        localStorage.setItem('github_filters', JSON.stringify({
          repositories: data.repositories,
          repositoryStats: data.repositoryStats,
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
        if (parsedFilters.repositoryStats) {
          const statsMap: Record<string, { count: number, lastEventDate: string, recentTypes: string[] }> = {};
          parsedFilters.repositoryStats.forEach((r: { name: string, count: number, lastEventDate: string, recentTypes?: string[] }) => {
            statsMap[r.name] = { count: r.count, lastEventDate: r.lastEventDate, recentTypes: r.recentTypes || [] };
          });
          setRepoStats(statsMap);
        }

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
  // Uses window scroll since the timeline flows in the page naturally
  React.useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight } = document.documentElement;
      const clientHeight = window.innerHeight;
      // Load more when user is 400px from bottom of page
      if (scrollHeight - scrollTop - clientHeight < 400 && !loading && page < totalPages) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
              const message = replaceGithubEmoji(normalizedMessage || 'No commit message provided');
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
      eventDetails.description = replaceGithubEmoji(description);
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

  const getRelativeTime = (isoDate: string) => {
    try {
      return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
    } catch {
      return '';
    }
  };

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
      padding: 0,
      maxWidth: { xs: '100%', lg: isMobile || alwaysColumn ? '100%' : 'calc(100vw - 20px)' },
      width: {
        lg: alwaysColumn ? '100%' : '1144px',
        xs: '100%'
      },
      minWidth: 0,
      overflow: 'hidden',
      margin: alwaysColumn ? 0 : '0 10px'
    }}>
      {!alwaysColumn && <Box sx={{ mb: 1, px: { xs: 1.5, lg: 0 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        {globalTotalEvents > 0 && (
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
              {globalTotalEvents} total events
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
      </Box>}
      {/* === MOBILE LAYOUT: repo strip + timeline === */}
      {(isMobile || alwaysColumn) ? (
        <Box sx={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {error && (
            <Typography color="error" sx={{ mb: 1, px: 1.5 }}>{error}</Typography>
          )}

          {/* Horizontal Repo Strip - sticky at top */}
          <Box
            sx={{
              px: 1.5,
              py: 1.5,
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.divider}`,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              ...(!alwaysColumn && {
                position: 'sticky',
                top: 'var(--MuiDocs-header-height, 60px)',
                zIndex: 10,
              }),
              bgcolor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* "All" repo card */}
            <Box
              onClick={() => setRepoFilter('')}
              sx={{
                minWidth: 130,
                maxWidth: 130,
                height: 80,
                p: 1.5,
                cursor: 'pointer',
                borderRadius: 2,
                border: `1px solid ${!repoFilter ? theme.palette.primary.main : theme.palette.divider}`,
                bgcolor: !repoFilter
                  ? alpha(theme.palette.primary.main, 0.08)
                  : theme.palette.background.paper,
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexShrink: 0,
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    fontWeight: 600,
                    color: !repoFilter ? 'primary.main' : 'text.primary',
                    fontSize: '0.8rem',
                  }}
                >
                  All Repos
                </Typography>
                <Chip
                  label={globalTotalEvents}
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    bgcolor: !repoFilter
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.text.secondary, 0.15),
                    color: !repoFilter ? 'primary.main' : 'text.secondary',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {mobileRepoGroups[0]?.lastEventDate ? getRelativeTime(mobileRepoGroups[0].lastEventDate) : ''}
              </Typography>
            </Box>

            {mobileRepoGroups.map((repo) => {
              const isSelected = repoFilter === repo.name;
              return (
                <Box
                  key={repo.name}
                  onClick={() => setRepoFilter(repo.name)}
                  sx={{
                    minWidth: 150,
                    maxWidth: 150,
                    height: 80,
                    p: 1.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                        color: isSelected ? 'primary.main' : 'text.primary',
                        fontSize: '0.8rem',
                        maxWidth: 90,
                      }}
                    >
                      {repo.shortName}
                    </Typography>
                    <Chip
                      label={repo.totalCount}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.2)
                          : alpha(theme.palette.text.secondary, 0.15),
                        color: isSelected ? 'primary.main' : 'text.secondary',
                      }}
                    />
                  </Box>

                  {/* Event type icons from DB stats (persists across filter changes) */}
                  <Box sx={{ display: 'flex', gap: 0.5, overflow: 'hidden' }}>
                    {repo.recentTypes.map((eventType, i) => {
                      const actionName = getActionName(eventType);
                      return (
                        <Box
                          key={`${repo.name}-${eventType}-${i}`}
                          sx={{
                            color: getEventColor(eventType),
                            opacity: 0.8,
                            display: 'flex',
                            '& .MuiSvgIcon-root': { fontSize: 16 },
                          }}
                        >
                          {actionIcons[actionName] || null}
                        </Box>
                      );
                    })}
                  </Box>

                  {repo.lastEventDate ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {getRelativeTime(repo.lastEventDate)}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', opacity: 0.5 }}>
                      &mdash;
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Vertical Timeline */}
          <Box
            id={'events-table-container'}
            sx={{
              overflowY: 'auto',
              px: 2,
              py: 2,
              pb: 6,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {/* Repo header when filtered */}
            {repoFilter && (
              <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.95rem' }}>
                    {repoFilter}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mobileFilteredEvents.length} events
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Timeline events */}
            <Box sx={{
              position: 'relative',
              pl: 2.5,
              borderLeft: `2px solid ${theme.palette.divider}`,
            }}>
              {mobileFilteredEvents.map((event, index) => {
                const showDateRow = event.dateOnly !== latestDateDisplayed;
                latestDateDisplayed = event.dateOnly;
                const eventColor = getEventColor(event.actionType);

                return (
                  <React.Fragment key={event.id || index}>
                    {showDateRow && (
                      <Box sx={{ mb: 1, mt: index > 0 ? 2 : 0, ml: -0.5 }}>
                        <Typography variant="caption" sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {event.dateOnly}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      id={event.id}
                      sx={{ mb: 3, position: 'relative' }}
                    >
                      {/* Timeline dot */}
                      <Box sx={{
                        position: 'absolute',
                        left: -26,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        border: `2px solid ${eventColor}`,
                        zIndex: 1,
                      }} />

                      {/* Event header: chip + time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Chip
                          icon={actionIcons[event.action] ? React.cloneElement(actionIcons[event.action], { sx: { fontSize: 14, color: `${eventColor} !important` } }) : undefined}
                          label={event.action}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(eventColor, 0.12),
                            color: eventColor,
                            border: `1px solid ${alpha(eventColor, 0.25)}`,
                            '& .MuiChip-icon': { ml: 0.5 },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {getTimeOnly(event.date)}
                        </Typography>
                      </Box>

                      {/* Event content card */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                        }}
                      >
                        {/* Actor info */}
                        {event.payload?.actor?.login && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Avatar
                              src={event.payload?.actor?.avatar_url || event.avatarUrl || ''}
                              sx={{ width: 20, height: 20, mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                              {event.payload?.actor?.login || event.user || ''}
                            </Typography>
                          </Box>
                        )}

                        {/* Repo name (when showing all repos) */}
                        {!repoFilter && (
                          <Typography variant="caption" sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            mb: 0.75,
                            display: 'block',
                          }}>
                            {event.repo}
                          </Typography>
                        )}

                        {/* === PUSH EVENT: branch + commits === */}
                        {event.actionType === 'PushEvent' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {event.ref && (
                              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <CodeIcon sx={{ fontSize: 14, mr: 0.75 }} />
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                  {event.ref.replace('refs/heads/', '')}
                                </Typography>
                              </Box>
                            )}
                            {event.commitsList && event.commitsList.length > 0 ? (
                              event.commitsList.map((commit: any) => (
                                <Box key={commit.sha} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                  <CodeIcon sx={{ fontSize: 14, mt: '2px', color: 'text.secondary' }} />
                                  <Box>
                                    <Typography variant="caption" sx={{
                                      fontFamily: 'monospace',
                                      color: 'primary.main',
                                      fontSize: '0.8rem',
                                      mr: 1,
                                    }}>
                                      {commit.sha.substring(0, 7)}
                                    </Typography>
                                    <Typography variant="body2" component="span" sx={{ fontSize: '0.8rem' }}>
                                      {replaceGithubEmoji(commit.message.split('\n')[0])}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
                                {event.description}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* === PULL REQUEST / ISSUE EVENT: title, number, labels, body === */}
                        {(event.actionType === 'PullRequestEvent' || event.actionType === 'IssuesEvent') && (
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                              {event.payload?.pull_request?.title || event.payload?.issue?.title || event.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                              #{event.payload?.pull_request?.number || event.payload?.issue?.number || event.number}
                            </Typography>
                            {/* Labels */}
                            {(event.payload?.pull_request?.labels || event.payload?.issue?.labels) && (
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                                {(event.payload?.pull_request?.labels || event.payload?.issue?.labels || []).map((label: any) => (
                                  <Chip
                                    key={typeof label === 'string' ? label : label.name}
                                    label={typeof label === 'string' ? label : label.name}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      bgcolor: typeof label === 'string' ? '#21262d' : (label.color ? `#${label.color}` : '#21262d'),
                                      color: 'text.secondary',
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                            {/* Body text */}
                            {(event.payload?.pull_request?.body || event.payload?.issue?.body) && (
                              <Typography variant="body2" sx={{
                                color: 'text.secondary',
                                fontSize: '0.8rem',
                                whiteSpace: 'pre-wrap',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {event.payload?.pull_request?.body || event.payload?.issue?.body}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* === ISSUE COMMENT EVENT === */}
                        {event.actionType === 'IssueCommentEvent' && (
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                              {event.description}
                            </Typography>
                            {event.payload?.comment?.body && (
                              <Typography variant="body2" sx={{
                                color: 'text.secondary',
                                fontSize: '0.8rem',
                                whiteSpace: 'pre-wrap',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}>
                                {event.payload.comment.body}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* === CREATE EVENT: branch/tag name === */}
                        {event.actionType === 'CreateEvent' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AddBoxIcon sx={{ fontSize: 16, color: eventColor }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {event.payload?.ref || event.ref || event.description}
                            </Typography>
                          </Box>
                        )}

                        {/* === DELETE EVENT === */}
                        {event.actionType === 'DeleteEvent' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon sx={{ fontSize: 16, color: eventColor }} />
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {event.payload?.ref || event.ref || event.description}
                            </Typography>
                          </Box>
                        )}

                        {/* Fallback for other event types */}
                        {!['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'IssueCommentEvent', 'CreateEvent', 'DeleteEvent'].includes(event.actionType) && (
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.primary' }}>
                            {event.description || `${event.action} in ${event.repo.split('/')[1]}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </React.Fragment>
                );
              })}

              {mobileFilteredEvents.length === 0 && !loading && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No events found</Typography>
                </Box>
              )}

              {loading && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <CircularProgress size={32} />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        /* === DESKTOP LAYOUT: side-by-side === */
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1px',
          width: '100%',
          border: 0,
          position: 'relative',
        }}>
          <Box
            sx={{
              width: '460px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: 0,
            }}
            className="master-container"
          >
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            )}
            {!alwaysColumn && filters}

            <Box
              id={'events-table-container'}
              sx={{
                borderRadius: '0',
                position: 'relative',
                overflow: 'hidden',
                border: 0,
                backgroundColor: theme.palette.background.paper,
              }}>
              <Box sx={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,.1)',
                overflowY: 'hidden'
              }}>
                {events.map((event, index) => {
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
                {events.length === 0 && !loading && (
                  <Box sx={{ padding: 2, textAlign: 'center' }}>
                    No events found
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
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: '461px',
                maxWidth: '726.8px',
                overflow: 'auto',
                marginTop: 0,
              }}>
              <MetadataDisplay
                sx={{
                  borderTopRightRadius: theme.shape.borderRadius,
                  borderTopLeftRadius: 0,
                  borderBottomRightRadius: theme.shape.borderRadius,
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
                    }}
                  />)}
              </MetadataDisplay>
            </Box>
          )}
        </Box>
      )}

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
