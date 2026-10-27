import { historicalPlans, listPlans } from './plan-store';

export async function planFeedProps(author?: string, page = 1) {
  try {
    return { ...await listPlans(author, page), author: author || null, unavailable: false };
  } catch {
    const history = historicalPlans();
    const filtered = history.filter((post) => !author || post.authors.includes(author)).sort((a, b) => b.date.localeCompare(a.date));
    return {
      posts: filtered.slice((page - 1) * 20, page * 20),
      authors: [...new Set(['bstoked', 'hal', ...history.flatMap((post) => post.authors)])].sort(),
      author: author || null, total: filtered.length, page, unavailable: true,
    };
  }
}
