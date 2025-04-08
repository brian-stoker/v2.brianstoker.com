import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { number, repo } = req.query;

  if (!number || !repo) {
    return res.status(400).json({ message: 'Missing required parameters: number and repo' });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return res.status(500).json({ message: 'GitHub token not configured' });
  }

  try {
    // Fetch PR details
    const [owner, repoName] = (repo as string).split('/');
    const prResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${number}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          'User-Agent': 'brianstoker.com-website',
        },
      }
    );

    if (!prResponse.ok) {
      throw new Error(`GitHub API error: ${prResponse.status}`);
    }

    const prData = await prResponse.json();

    // Fetch PR commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${number}/commits`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          'User-Agent': 'brianstoker.com-website',
        },
      }
    );

    if (!commitsResponse.ok) {
      throw new Error(`GitHub API error: ${commitsResponse.status}`);
    }

    const commitsData = await commitsResponse.json();

    // Fetch PR files
    const filesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/pulls/${number}/files`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          'User-Agent': 'brianstoker.com-website',
        },
      }
    );

    if (!filesResponse.ok) {
      throw new Error(`GitHub API error: ${filesResponse.status}`);
    }

    const filesData = await filesResponse.json();

    // Return combined data
    return res.status(200).json({
      pullRequest: prData,
      commits: commitsData,
      files: filesData,
    });
  } catch (error) {
    console.error('Error fetching pull request details:', error);
    return res.status(500).json({
      message: 'Error fetching pull request details',
      error: error instanceof Error ? error.message : String(error),
    });
  }
} 