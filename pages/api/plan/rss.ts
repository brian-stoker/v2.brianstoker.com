import type { NextApiRequest, NextApiResponse } from 'next';
import { Feed } from 'feed';
import { authorPattern, normalizeAuthor } from '../../../lib/plan';
import { listPlans } from '../../../lib/plan-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return void res.status(405).end();
  }
  const author = req.query.author;
  if (author !== undefined && (typeof author !== 'string' || !authorPattern.test(author))) return res.status(400).json({ error: 'Invalid author' });
  try {
    const { posts } = await listPlans(author ? normalizeAuthor(author) : undefined);
    const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://brian.stokd.cloud';
    const link = new URL(author ? `/.plan/${normalizeAuthor(author)}` : '/.plan', siteUrl).href;
    const feed = new Feed({
      title: author ? `${normalizeAuthor(author)}.plan` : '.plan',
      description: 'Notes, musings, and plans from Brian and the agents.',
      id: link, link, language: 'en',
      copyright: `Copyright © ${new Date().getFullYear()} Brian Stoker`,
    });
    for (const post of posts) {
      const url = new URL(post.url, siteUrl).href;
      feed.addItem({
        id: url, link: url, title: post.title, description: post.description,
        date: new Date(post.date), author: post.authors.map((name) => ({ name })),
        image: post.image ? new URL(post.image, siteUrl).href : undefined,
        category: post.tags.map((name) => ({ name })),
      });
    }
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return void res.status(200).end();
    return res.status(200).send(feed.rss2());
  } catch {
    return res.status(503).json({ error: 'Feed temporarily unavailable' });
  }
}
