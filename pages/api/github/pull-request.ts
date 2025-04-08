import type { NextApiRequest, NextApiResponse } from 'next'

interface PullRequestDetails {
  title: string;
  number: number;
  state: string;
  merged: boolean;
  mergeable: boolean;
  rebaseable: boolean;
  mergeable_state: string;
  merged_by?: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  labels: Array<{
    name: string;
    color: string;
  }>;
  draft: boolean;
  head: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      full_name: string;
    };
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  body: string;
  commits_list?: Array<{
    sha: string;
    commit: {
      message: string;
      author: {
        name: string;
        email: string;
        date: string;
      };
    };
    author: {
      login: string;
      avatar_url: string;
    };
  }>;
  files?: Array<{
    path: string;
    type: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
    diff: Array<{
      type: 'addition' | 'deletion' | 'context';
      content: string;
      lineNumber: number;
    }>;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { owner, repo, pull_number } = req.query;

    if (!owner || !repo || !pull_number) {
      return res.status(400).json({ message: 'Missing required parameters: owner, repo, pull_number' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    const headers = {
      Authorization: `token ${githubToken}`,
      'User-Agent': 'brianstoker.com-website',
    };

    async function fetchWithRateLimit(url: string) {
      const response = await fetch(url, { headers });
      
      const rateLimit = {
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
      };

      if (!response.ok) {
        if (response.status === 403 && rateLimit.remaining === '0') {
          const resetDate = new Date(Number(rateLimit.reset) * 1000);
          throw new Error(`Rate limit exceeded. Resets at ${resetDate.toLocaleString()}`);
        }
        throw new Error(`GitHub API error: ${response.status} - ${await response.text()}`);
      }

      return { data: await response.json(), rateLimit };
    }

    // Fetch basic PR information
    const { data: prData } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`
    );

    // Fetch commits for this PR
    const { data: commitsData } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/commits`
    );

    // Fetch file changes
    const { data: filesData, rateLimit } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`
    );

    // Process file changes to match our interface
    const processedFiles = filesData.map((file: any) => {
      // Parse the patch into diff lines
      const diff = file.patch ? file.patch.split('\n').map((line: string, index: number) => {
        let type: 'addition' | 'deletion' | 'context' = 'context';
        if (line.startsWith('+')) {
          type = 'addition';
        } else if (line.startsWith('-')) {
          type = 'deletion';
        }
        return {
          type,
          content: line,
          lineNumber: index + 1
        };
      }) : [];

      return {
        path: file.filename,
        type: file.status === 'added' ? 'added' : 
              file.status === 'removed' ? 'deleted' : 'modified',
        additions: file.additions,
        deletions: file.deletions,
        diff
      };
    });

    // Combine all the data
    const pullRequestDetails: PullRequestDetails = {
      ...prData,
      commits_list: commitsData,
      files: processedFiles
    };

    // Include rate limit info in response headers
    res.setHeader('X-RateLimit-Limit', rateLimit.limit || '');
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining || '');
    res.setHeader('X-RateLimit-Reset', rateLimit.reset || '');

    return res.status(200).json(pullRequestDetails);
  } catch (error) {
    console.error('Error fetching pull request details:', error);
    return res.status(error instanceof Error && error.message.includes('Rate limit') ? 429 : 500).json({ 
      message: 'Error fetching pull request details',
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 