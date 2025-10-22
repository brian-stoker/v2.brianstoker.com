import type { GitHubEvent } from '../types/github';
import { pruneEventPayload, createIndexEntry, EventIndexEntry } from './eventCachePruning';

const INDEX_CACHE_KEY = 'github_events_index_v1';
const DETAILS_CACHE_KEY = 'github_events_details_v1';
const CACHE_VERSION = '5.0';

const MAX_INDEX_ENTRIES = 1000;
const MAX_DETAILS_ENTRIES = 150;

/**
 * Index cache structure - lightweight entries for list display
 */
export interface EventIndexCache {
  version: string;
  events: EventIndexEntry[];
  lastFetched: number;
  totalCount: number;
}

/**
 * Event details for detail pane display
 */
export interface EventDetails {
  id: string;
  created_at: string;
  repo: string;
  type: string;
  payload: any;
}

/**
 * Details cache structure with LRU tracking
 */
export interface EventDetailsCache {
  version: string;
  events: Record<string, EventDetails>;
  lru: string[];
  maxSize: number;
  lastFetched: number;
}

/**
 * Safe localStorage operations with quota handling
 */
function safeSetItem(key: string, value: any): boolean {
  try {
    const json = JSON.stringify(value);
    const sizeKB = new Blob([json]).size / 1024;
    console.log(`[Cache] Saving ${key}: ${sizeKB.toFixed(2)} KB`);

    localStorage.setItem(key, json);
    console.log(`[Cache] Successfully saved ${key}`);
    return true;
  } catch (err) {
    console.error(`[Cache] Failed to save ${key}:`, err);
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      console.warn('[Cache] Quota exceeded, clearing old caches');
      // Try clearing old cache keys
      ['github_events', 'github_events_cache'].forEach(oldKey => {
        try {
          localStorage.removeItem(oldKey);
          console.log(`[Cache] Removed old cache key: ${oldKey}`);
        } catch (e) {
          // Ignore
        }
      });
      // Try again
      try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`[Cache] Successfully saved ${key} after cleanup`);
        return true;
      } catch (retryErr) {
        console.error('[Cache] Still failed after cleanup');
        return false;
      }
    }
    return false;
  }
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`[Cache] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

// ========================================
// INDEX CACHE OPERATIONS
// ========================================

/**
 * Get index cache
 */
export function getIndexCache(): EventIndexCache {
  return safeGetItem(INDEX_CACHE_KEY, {
    version: CACHE_VERSION,
    events: [],
    lastFetched: 0,
    totalCount: 0
  });
}

/**
 * Update index cache with new events
 */
export function updateIndexCache(
  newEvents: GitHubEvent[],
  totalCount: number
): boolean {
  const cache = getIndexCache();

  // Convert new events to index entries
  const newEntries = newEvents.map(createIndexEntry);

  // Merge with existing, removing duplicates
  const existingMap = new Map(cache.events.map(e => [e.id, e]));
  newEntries.forEach(entry => {
    existingMap.set(entry.id, entry);
  });

  // Convert back to array and sort by date (newest first)
  let allEntries = Array.from(existingMap.values());
  allEntries.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Keep only most recent MAX_INDEX_ENTRIES
  if (allEntries.length > MAX_INDEX_ENTRIES) {
    console.log(`[Index Cache] Pruning from ${allEntries.length} to ${MAX_INDEX_ENTRIES}`);
    allEntries = allEntries.slice(0, MAX_INDEX_ENTRIES);
  }

  const updatedCache: EventIndexCache = {
    version: CACHE_VERSION,
    events: allEntries,
    lastFetched: Date.now(),
    totalCount
  };

  return safeSetItem(INDEX_CACHE_KEY, updatedCache);
}

/**
 * Get events from index by page with filters
 */
export function getIndexPage(
  page: number,
  perPage: number,
  filters?: {
    repo?: string;
    action?: string;
    date?: string;
    description?: string;
  }
): { entries: EventIndexEntry[], totalFiltered: number } {
  const cache = getIndexCache();
  let filtered = cache.events;

  // Apply filters
  if (filters) {
    filtered = filtered.filter(entry => {
      if (filters.repo) {
        const repoName = entry.repo.split('/')[1] || entry.repo;
        if (repoName !== filters.repo) return false;
      }

      if (filters.action) {
        const action = entry.type.replace('Event', '');
        if (action !== filters.action) return false;
      }

      if (filters.date) {
        const filterDate = getFilterDate(filters.date);
        if (filterDate && new Date(entry.created_at) < filterDate) {
          return false;
        }
      }

      if (filters.description) {
        const summary = entry.filter_meta.summary || '';
        const title = entry.filter_meta.title || '';
        if (!summary.toLowerCase().includes(filters.description.toLowerCase()) &&
            !title.toLowerCase().includes(filters.description.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  const startIdx = (page - 1) * perPage;
  const entries = filtered.slice(startIdx, startIdx + perPage);

  return {
    entries,
    totalFiltered: filtered.length
  };
}

function getFilterDate(filter: string): Date | null {
  const now = new Date();
  switch (filter) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    default:
      return null;
  }
}

// ========================================
// DETAILS CACHE OPERATIONS (LRU)
// ========================================

/**
 * Get details cache
 */
export function getDetailsCache(): EventDetailsCache {
  return safeGetItem(DETAILS_CACHE_KEY, {
    version: CACHE_VERSION,
    events: {},
    lru: [],
    maxSize: MAX_DETAILS_ENTRIES,
    lastFetched: 0
  });
}

/**
 * Get event details by ID
 */
export function getEventDetails(eventId: string): EventDetails | null {
  const cache = getDetailsCache();
  const details = cache.events[eventId];

  if (details) {
    // Update LRU - move to end (most recently used)
    updateLRU(eventId);
  }

  return details || null;
}

/**
 * Add event details to cache
 */
export function addEventDetails(event: GitHubEvent): boolean {
  const cache = getDetailsCache();

  // Create pruned details entry
  const details: EventDetails = {
    id: event.id,
    created_at: event.created_at,
    repo: event.repo.name,
    type: event.type,
    payload: pruneEventPayload(event)
  };

  // Add to cache
  cache.events[event.id] = details;

  // Update LRU
  cache.lru = cache.lru.filter(id => id !== event.id);
  cache.lru.push(event.id);

  // Evict oldest if over capacity
  while (cache.lru.length > cache.maxSize) {
    const evictId = cache.lru.shift();
    if (evictId) {
      delete cache.events[evictId];
      console.log(`[Details Cache] Evicted ${evictId} (LRU)`);
    }
  }

  cache.lastFetched = Date.now();

  return safeSetItem(DETAILS_CACHE_KEY, cache);
}

/**
 * Batch add event details
 */
export function addManyEventDetails(events: GitHubEvent[]): boolean {
  const cache = getDetailsCache();

  events.forEach(event => {
    const details: EventDetails = {
      id: event.id,
      created_at: event.created_at,
      repo: event.repo.name,
      type: event.type,
      payload: pruneEventPayload(event)
    };

    cache.events[event.id] = details;

    // Update LRU
    cache.lru = cache.lru.filter(id => id !== event.id);
    cache.lru.push(event.id);
  });

  // Evict oldest entries if over capacity
  while (cache.lru.length > cache.maxSize) {
    const evictId = cache.lru.shift();
    if (evictId) {
      delete cache.events[evictId];
    }
  }

  cache.lastFetched = Date.now();

  return safeSetItem(DETAILS_CACHE_KEY, cache);
}

/**
 * Update LRU order
 */
function updateLRU(eventId: string): void {
  const cache = getDetailsCache();
  cache.lru = cache.lru.filter(id => id !== eventId);
  cache.lru.push(eventId);
  safeSetItem(DETAILS_CACHE_KEY, cache);
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  localStorage.removeItem(INDEX_CACHE_KEY);
  localStorage.removeItem(DETAILS_CACHE_KEY);
  console.log('[Cache] Cleared all caches');
}

/**
 * Migrate from old cache format (version 4.0) to new format
 */
export function migrateOldCache(): void {
  const oldCache = safeGetItem('github_events', null);

  if (!oldCache || oldCache.version !== '4.0') {
    console.log('[Cache] No old cache to migrate');
    return;
  }

  console.log(`[Cache] Migrating ${oldCache.events?.length || 0} events from v4.0 to v5.0`);

  const events: GitHubEvent[] = oldCache.events || [];

  // Create index cache
  updateIndexCache(events, oldCache.totalCount || events.length);

  // Create details cache (keep most recent MAX_DETAILS_ENTRIES)
  const recentEvents = events.slice(0, MAX_DETAILS_ENTRIES);
  addManyEventDetails(recentEvents);

  // Remove old cache
  localStorage.removeItem('github_events');

  console.log('[Cache] Migration complete');
}
