import type { NextApiRequest, NextApiResponse } from 'next';
import { timingSafeEqual } from 'crypto';
import { ObjectId } from 'mongodb';
import { authorPattern, normalizeAuthor } from '../../../lib/plan';
import { historicalPlans, listPlans, planCollection, publicPost, StoredPlan } from '../../../lib/plan-store';

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

function authorized(req: NextApiRequest) {
  const key = process.env.PLAN_API_KEY;
  const actual = req.headers.authorization || '';
  const expected = `Bearer ${key}`;
  return !!key && Buffer.byteLength(actual) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function imageData(image: unknown): { data: Buffer; type: string; alt: string } | null {
  if (image === undefined) return null;
  if (!image || typeof image !== 'object') throw new Error('image must contain base64, contentType and alt');
  const { base64, contentType, alt } = image as Record<string, unknown>;
  if (typeof base64 !== 'string' || base64.length > 1400000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) throw new Error('Invalid image base64 (maximum 1 MiB)');
  const data = Buffer.from(base64, 'base64');
  if (!data.length || data.length > 1024 * 1024) throw new Error('Image must be between 1 byte and 1 MiB');
  const type = String(contentType);
  const valid = (type === 'image/png' && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    || (type === 'image/jpeg' && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    || (type === 'image/webp' && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP');
  if (!valid) throw new Error('Only PNG, JPEG and WebP images with matching file signatures are supported');
  if (typeof alt !== 'string' || !alt.trim() || alt.length > 500) throw new Error('Image alt text is required (maximum 500 characters)');
  return { data, type, alt: alt.trim() };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const author = req.query.author;
    const page = Number(req.query.page || 1);
    if ((author !== undefined && (typeof author !== 'string' || !authorPattern.test(author))) || !Number.isInteger(page) || page < 1 || page > 1000) return res.status(400).json({ error: 'Invalid author or page (1–1000)' });
    try {
      return res.status(200).json(await listPlans(author ? normalizeAuthor(author) : undefined, page));
    } catch {
      return res.status(503).json({ error: 'Plans are temporarily unavailable. Please try again.' });
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  let post: StoredPlan;
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Expected a JSON object');
    if (typeof body.author !== 'string' || !authorPattern.test(body.author)) throw new Error('author must be a lowercase handle (1–40 letters, digits or hyphens; starts with a letter)');
    if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 100000) throw new Error('text is required (maximum 100000 characters)');
    if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 200)) throw new Error('title must be 1–200 characters');
    if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 10 || body.tags.some((tag: unknown) => typeof tag !== 'string' || !tag.trim() || tag.length > 40))) throw new Error('tags must contain at most ten nonempty strings (40 characters each)');
    if (historicalPlans().some((post) => post.id === normalizeAuthor(body.author))) throw new Error('author conflicts with an archived article URL');
    const image = imageData(body.image);
    const id = new ObjectId();
    post = {
      _id: id, authors: [normalizeAuthor(body.author)], text: body.text.trim(),
      title: body.title?.trim() || body.text.trim().split('\n')[0].slice(0, 100),
      description: body.text.trim().slice(0, 240), date: new Date().toISOString(),
      tags: (body.tags || []).map((tag: string) => tag.trim()),
      image: image ? `/api/plan/images/${id.toHexString()}` : null, imageAlt: image?.alt || '',
      ...(image ? { imageData: image.data, imageType: image.type } : {}),
    };
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid post' });
  }
  try {
    await (await planCollection()).insertOne(post);
    const published = publicPost(post);
    res.setHeader('Location', published.url);
    return res.status(201).json({ post: published });
  } catch {
    return res.status(503).json({ error: 'Publishing is temporarily unavailable. Please try again.' });
  }
}
