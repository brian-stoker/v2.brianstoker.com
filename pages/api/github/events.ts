import type { NextApiRequest, NextApiResponse } from 'next'

type GitHubEvent = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: any;
}

type ActivityData = {
  data: { date: string, count: number, level: number }[];
  lastUpdated: string | null;
}

function parseLinkHeader(header: string | null): { next?: string; last?: string } {
  if (!header) return {};
  
  return header.split(',').reduce((links: { next?: string; last?: string }, part) => {
    const match = part.match(/<(.+)>;\s*rel="([\w]+)"/);
    if (match) {
      const [, url, rel] = match;
      if (rel === 'next' || rel === 'last') {
        links[rel] = url;
      }
    }
    return links;
  }, {});
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      per_page = '40',
      repo = '',
      action = '',
      date = '',
      description = ''
    } = req.query;

    // Get GitHub token from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    // Get GitHub username from environment variables or use a default
    const githubUser = process.env.GITHUB_USERNAME || 'brian-stoker';

    if (!githubToken) {
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    // Fetch all available pages from GitHub API
    let allEvents: GitHubEvent[] = [];
    let hasMore = true;
    let githubPage = 1;
    const maxPages = 30; // GitHub's maximum for events endpoint
    
    while (hasMore && githubPage <= maxPages) {
      const response = await fetch(
        `https://api.github.com/users/${githubUser}/events?page=${githubPage}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'User-Agent': 'brianstoker.com-website',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.length === 0) {
        hasMore = false;
      } else {
        allEvents = [...allEvents, ...data];
        
        // Check Link header to see if there are more pages
        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);
        if (!links.next) {
          hasMore = false;
        }
        
        githubPage++;
      }
    }

    // Apply filters
    let filteredEvents = allEvents;

    if (repo) {
      filteredEvents = filteredEvents.filter(event => event.repo.name === repo);
    }

    if (action) {
      filteredEvents = filteredEvents.filter(event => {
        const eventAction = event.type.replace('Event', '');
        return eventAction === action;
      });
    }

    if (date) {
      const now = new Date();
      let cutoffDate: Date;

      switch (date) {
        case 'today':
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          cutoffDate = new Date(now);
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.created_at);
        return eventDate >= cutoffDate;
      });
    }

    if (description) {
      filteredEvents = filteredEvents.filter(event => {
        let eventDescription = '';
        if (event.type === 'PushEvent' && event.payload.commits?.length) {
          eventDescription = `Pushed ${event.payload.commits.length} commits`;
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          eventDescription = event.payload.pull_request.title;
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          eventDescription = event.payload.issue.title;
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          eventDescription = `Commented on issue: ${event.payload.issue.title}`;
        }
        return eventDescription.toLowerCase().includes((description as string).toLowerCase());
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const startIndex = (pageNum - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Extract unique values for filters (only on first page)
    const repositories = pageNum === 1 ? [...new Set(allEvents.map(event => event.repo.name))].sort() : [];
    const actionTypes = pageNum === 1 ? [...new Set(allEvents.map(event => event.type.replace('Event', '')))].sort() : [];

    // Return paginated results with metadata
    return res.status(200).json({
      events: paginatedEvents,
      total: filteredEvents.length,
      repositories,
      actionTypes,
      page: pageNum,
      per_page: perPage,
      total_pages: Math.ceil(filteredEvents.length / perPage)
    });

  } catch (error) {
    console.error('Error fetching GitHub events:', error);
    return res.status(500).json({ 
      message: 'Error fetching GitHub events',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 