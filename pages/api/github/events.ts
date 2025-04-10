import * as React from 'react';
import type { NextApiRequest, NextApiResponse } from 'next'
import { GitHubEvent } from '../../../src/types/github';

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
      per_page = '100', // Changed to match GitHub's max per page
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
      console.error('GitHub token is missing');
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    console.log(`Fetching events for user: ${githubUser}`);
    
    // Fetch all available pages from GitHub API
    let allEvents: GitHubEvent[] = [];
    let hasMore = true;
    let githubPage = 1;
    const maxPages = 30; // GitHub's maximum for events endpoint
    
    while (hasMore && githubPage <= maxPages) {
      console.log(`Fetching page ${githubPage}...`);
      const response = await fetch(
        `https://api.github.com/users/${githubUser}/events?page=${githubPage}&per_page=100`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            'User-Agent': 'brianstoker.com-website',
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Page ${githubPage}: Received ${data.length} events`);
      
      if (data.length === 0) {
        hasMore = false;
      } else {
        allEvents = [...allEvents, ...data];
        console.log(`Total events so far: ${allEvents.length}`);
        
        // Check Link header to see if there are more pages
        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);
        hasMore = !!links.next; // Simplified logic
        
        githubPage++;
      }
    }

    console.log(`Final total events: ${allEvents.length}`);

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
    const repositories = [...new Set(allEvents.map(event => event.repo.name))].sort();
    const actionTypes = [...new Set(allEvents.map(event => event.type.replace('Event', '')))].sort();

    // Return paginated results with metadata
    return res.status(200).json({
      events: paginatedEvents,
      total: filteredEvents.length,
      repositories,
      actionTypes,
      page: pageNum,
      per_page: perPage,
      total_pages: Math.ceil(filteredEvents.length / perPage),
      total_fetched_events: allEvents.length,
      max_pages_fetched: githubPage - 1
    });

  } catch (error) {
    console.error('Error fetching GitHub events:', error);
    return res.status(500).json({ 
      message: 'Error fetching GitHub events',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 