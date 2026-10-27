import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../pages/api/lib/mongodb';
import { normalizeAuthor, PlanPost } from './plan';

export type StoredPlan = Omit<PlanPost, 'id' | 'url'> & { _id: ObjectId; imageData?: Buffer; imageType?: string };

export async function planCollection() {
  const db = await getDatabase();
  if (!db) throw new Error('Plan database is unavailable');
  return db.collection<StoredPlan>('plan_posts');
}

export function publicPost(doc: StoredPlan): PlanPost {
  const id = doc._id.toHexString();
  return {
    id, title: doc.title, ...(doc.text === undefined ? {} : { text: doc.text }), description: doc.description,
    authors: doc.authors, date: doc.date, image: doc.image,
    imageAlt: doc.imageAlt, tags: doc.tags, url: `/.plan/${doc.authors[0]}/${id}`,
  };
}

// Trusted, bundled history remains readable; new posts never compile submitted MDX.
export function historicalPlans(): PlanPost[] {
  const posts = new Map<string, PlanPost>();
  for (const dir of ['pages/home', 'data/.plan']) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;
    for (const file of fs.readdirSync(fullDir).filter((name) => name.endsWith('.mdx'))) {
      const { data } = matter(fs.readFileSync(path.join(fullDir, file), 'utf8'));
      const slug = file.slice(0, -4);
      const authors = (Array.isArray(data.authors) ? data.authors : [data.authors || 'bstoked']).map(normalizeAuthor);
      posts.set(slug, {
        id: slug, title: data.title || slug, description: data.description || '',
        authors, date: new Date(data.date || 0).toISOString(),
        image: data.image || null, imageAlt: data.imageAlt || data.title || '',
        tags: Array.isArray(data.tags) ? data.tags : [], url: `/.plan/${slug}`,
      });
    }
  }
  return [...posts.values()];
}

export async function listPlans(author?: string, page = 1) {
  const history = historicalPlans();
  const collection = await planCollection();
  const filter = author ? { authors: author } : {};
  const legacy = history.filter((post) => !author || post.authors.includes(author));
  // At most page*20 dynamic candidates are needed for this merged page.
  const [stored, count, dynamicAuthors] = await Promise.all([
    collection.find(filter, { projection: { imageData: 0, imageType: 0, text: 0 } }).sort({ date: -1, _id: -1 }).limit(page * 20).toArray(),
    collection.countDocuments(filter),
    collection.distinct('authors'),
  ]);
  const posts = [...legacy, ...stored.map(publicPost)].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const authors = [...new Set(['bstoked', 'hal', ...history.flatMap((post) => post.authors), ...dynamicAuthors])].sort();
  return { posts: posts.slice((page - 1) * 20, page * 20), authors, total: legacy.length + count, page };
}

export async function getPlan(author: string, id: string) {
  if (!/^[a-f0-9]{24}$/.test(id)) return null;
  const doc = await (await planCollection()).findOne({ _id: new ObjectId(id), authors: author }, { projection: { imageData: 0, imageType: 0 } });
  return doc ? publicPost(doc) : null;
}
