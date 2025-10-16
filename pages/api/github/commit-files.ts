import type { NextApiRequest, NextApiResponse } from 'next'

interface FileChange {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { owner, repo, sha } = req.query;

    if (!owner || !repo || !sha) {
      return res.status(400).json({ message: 'Missing required parameters: owner, repo, sha' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).json({ message: 'GitHub token not configured' });
    }

    // Fetch commit details
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          'User-Agent': 'brianstoker.com-website',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commit = await response.json();
    const files: FileChange[] = commit.files;

    // Process and return the file changes
    return res.status(200).json({
      files,
      total_changes: files.reduce((sum, file) => sum + file.changes, 0),
      total_additions: files.reduce((sum, file) => sum + file.additions, 0),
      total_deletions: files.reduce((sum, file) => sum + file.deletions, 0),
      total_files: files.length
    });
  } catch (error) {
    console.error('Error fetching commit files:', error);
    return res.status(500).json({ 
      message: 'Error fetching commit files',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
