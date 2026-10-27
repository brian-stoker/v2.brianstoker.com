import * as React from 'react';
import Stack from '@mui/material/Stack';
import { PostPreviewBox } from '../plan/PostPreview';
import type { BlogPost } from '../../../lib/sourcing';
import type { PlanPost } from '../../../lib/plan';

export default function BlogShowcase({ showcaseContent = [] }: { showcaseContent?: BlogPost[] }): React.JSX.Element {
  const [posts, setPosts] = React.useState(showcaseContent);
  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/api/plan', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Plans unavailable');
        return response.json();
      })
      .then((data: { posts: PlanPost[] }) => setPosts(data.posts.slice(0, 5).map((post) => ({
        ...post, slug: post.url.replace('/.plan/', ''),
      }))))
      .catch(() => { /* Keep the bundled archive if the feed is unavailable. */ });
    return () => controller.abort();
  }, []);
  return <Stack gap={2} alignContent="center" height="100%">
    {posts.map((post) => <PostPreviewBox key={post.slug} post={post} />)}
  </Stack>;
}
