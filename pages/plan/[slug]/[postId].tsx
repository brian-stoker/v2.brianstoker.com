import type { GetServerSideProps } from 'next';
import PlanFeed from '../../../src/components/plan/PlanFeed';
import { getPlan } from '../../../lib/plan-store';
import { authorPattern } from '../../../lib/plan';

export default PlanFeed;
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const author = params?.slug as string;
  const id = params?.postId as string;
  if (!authorPattern.test(author) || !/^[a-f0-9]{24}$/.test(id)) return { notFound: true };
  res.setHeader('Cache-Control', 'no-store');
  try {
    const post = await getPlan(author, id);
    if (!post) return { notFound: true };
    return { props: { posts: [], authors: [], author, total: 0, page: 1, post } };
  } catch {
    res.statusCode = 503;
    return { props: { posts: [], authors: [], author, total: 0, page: 1, unavailable: true } };
  }
};
