import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId, Binary } from 'mongodb';
import { planCollection } from '../../../../lib/plan-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return void res.status(405).end();
  }
  const id = req.query.id;
  if (typeof id !== 'string' || !/^[a-f0-9]{24}$/.test(id)) return void res.status(404).end();
  try {
    const post = await (await planCollection()).findOne({ _id: new ObjectId(id) }, { projection: { imageData: 1, imageType: 1 } });
    if (!post?.imageData || !post.imageType) return void res.status(404).end();
    // The driver returns BSON Binary for persisted Buffer fields.
    const stored = post.imageData as Buffer | Binary;
    const data = Buffer.isBuffer(stored) ? stored : Buffer.from(stored.value());
    res.setHeader('Content-Type', post.imageType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (req.method === 'HEAD') return void res.status(200).end();
    return res.status(200).send(data);
  } catch {
    return void res.status(503).end();
  }
}
