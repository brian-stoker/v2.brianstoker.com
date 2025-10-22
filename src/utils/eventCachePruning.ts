import type { GitHubEvent } from '../types/github';

/**
 * Lightweight event index entry for list display and filtering
 * Target size: ~200 bytes per entry
 */
export interface EventIndexEntry {
  id: string;
  created_at: string;
  repo: string;
  type: string;
  filter_meta: {
    summary: string;
    title?: string;
    commit_count?: number;
  };
}

/**
 * Prune event payload to only include fields used by detail components
 * Removes all unnecessary data to minimize storage
 */
export function pruneEventPayload(event: GitHubEvent): any {
  switch (event.type) {
    case 'PushEvent':
      return {
        ref: event.payload.ref,
        head: event.payload.head,
        before: event.payload.before,
        size: event.payload.size || event.payload.commits?.length || 0,
        commits: (event.payload.commits || []).map((commit: any) => ({
          message: commit.message || commit.commit?.message || '',
          sha: commit.sha,
          author: {
            name: commit.author?.name || commit.commit?.author?.name || 'Unknown'
          }
          // html_url omitted - reconstructed as: `https://github.com/${repo}/commit/${sha}`
        }))
      };

    case 'PullRequestEvent':
      const pr = event.payload.pull_request;
      return {
        action: event.payload.action,
        pull_request: {
          number: pr.number,
          title: pr.title,
          body: pr.body || '',
          state: pr.state,
          html_url: pr.html_url,
          user: {
            login: pr.user?.login || '',
            avatar_url: pr.user?.avatar_url || ''
          },
          base: { ref: pr.base?.ref || 'main' },
          head: { ref: pr.head?.ref || 'unknown' },
          _enriched: pr._enriched || false
        }
      };

    case 'IssuesEvent':
      const issue = event.payload.issue;
      return {
        action: event.payload.action,
        issue: {
          number: issue.number,
          title: issue.title,
          body: issue.body || '',
          state: issue.state,
          html_url: issue.html_url,
          comments: issue.comments || 0,
          labels: (issue.labels || []).map((label: any) => ({
            name: label.name,
            color: label.color
          }))
        }
      };

    case 'IssueCommentEvent':
      const issueComment = event.payload.issue;
      const comment = event.payload.comment;
      return {
        action: event.payload.action,
        issue: {
          number: issueComment.number,
          title: issueComment.title,
          state: issueComment.state,
          html_url: issueComment.html_url,
          user: {
            login: issueComment.user?.login || '',
            avatar_url: issueComment.user?.avatar_url || ''
          }
        },
        comment: {
          body: comment.body || '',
          html_url: comment.html_url,
          created_at: comment.created_at,
          user: {
            login: comment.user?.login || '',
            avatar_url: comment.user?.avatar_url || ''
          }
        }
      };

    case 'CreateEvent':
    case 'DeleteEvent':
      return {
        ref_type: event.payload.ref_type,
        ref: event.payload.ref,
        description: event.payload.description
      };

    default:
      // For unknown event types, return minimal payload
      return event.payload;
  }
}

/**
 * Create lightweight index entry from full event
 */
export function createIndexEntry(event: GitHubEvent): EventIndexEntry {
  const filterMeta = computeFilterMeta(event);

  return {
    id: event.id,
    created_at: event.created_at,
    repo: event.repo.name,
    type: event.type,
    filter_meta: filterMeta
  };
}

/**
 * Compute filter metadata based on event type
 */
function computeFilterMeta(event: GitHubEvent): EventIndexEntry['filter_meta'] {
  switch (event.type) {
    case 'PushEvent':
      const commitCount = event.payload.commits?.length || event.payload.size || 0;
      return {
        summary: `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''}`,
        commit_count: commitCount
      };

    case 'PullRequestEvent':
      return {
        summary: event.payload.pull_request.title,
        title: event.payload.pull_request.title
      };

    case 'IssuesEvent':
      return {
        summary: event.payload.issue.title,
        title: event.payload.issue.title
      };

    case 'IssueCommentEvent':
      return {
        summary: `Commented on issue: ${event.payload.issue.title}`,
        title: event.payload.issue.title
      };

    case 'CreateEvent':
      return {
        summary: `Created ${event.payload.ref_type} ${event.payload.ref}`
      };

    case 'DeleteEvent':
      return {
        summary: `Deleted ${event.payload.ref_type} ${event.payload.ref}`
      };

    default:
      return {
        summary: event.type.replace('Event', '')
      };
  }
}
