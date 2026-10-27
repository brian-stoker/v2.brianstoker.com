import type { GetServerSideProps } from 'next';
import PlanFeed from '../../src/components/plan/PlanFeed';
import { planFeedProps } from '../../lib/plan-feed-props';

export default PlanFeed;
export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  const page = Number(query.page || 1);
  if (!Number.isInteger(page) || page < 1 || page > 1000) return { notFound: true };
  const props = await planFeedProps(undefined, page);
  res.setHeader('Cache-Control', 'no-store');
  return { props };
};
