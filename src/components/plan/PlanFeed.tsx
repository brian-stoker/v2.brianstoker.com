import * as React from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import PaginationItem from '@mui/material/PaginationItem';
import { Alert, Box, Card, CardContent, CardMedia, Chip, Container, Divider, Link, Pagination, Typography } from '@mui/material';
import { BrandingCssVarsProvider } from '@stoked-ui/docs';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import Main from 'src/components/Main';
import type { PlanPost } from '../../../lib/plan';

export interface PlanFeedProps {
  posts: PlanPost[];
  authors: string[];
  author?: string | null;
  total: number;
  page: number;
  unavailable?: boolean;
  post?: PlanPost | null;
}

export default function PlanFeed({ posts, authors, author, total, page, unavailable, post }: PlanFeedProps) {
  const title = post?.title || (author ? `${author}.plan` : '.plan');
  const base = author ? `/.plan/${author}` : '/.plan';
  return (
    <BrandingCssVarsProvider>
      <Head><title>{`${title} | Brian Stoker`}</title><meta name="description" content={post?.description || 'Notes, musings, and plans from Brian and the agents.'} /></Head>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppHeader />
        <Main id="main-content" style={{ flex: 1 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
            {post ? (
              <Box component="article" sx={{ maxWidth: '72ch', mx: 'auto', overflowWrap: 'anywhere' }}>
                <Link component={NextLink} href={base}>← {author}.plan</Link>
                <Typography component="h1" variant="h2" sx={{ mt: 3, mb: 2 }}>{post.title}</Typography>
                <PostByline post={post} />
                {post.image && <Box component="img" src={post.image} alt={post.imageAlt} sx={{ width: '100%', height: 'auto', borderRadius: 2, my: 3 }} />}
                <Typography component="div" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, mt: 3 }}>{post.text}</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 2, overflowWrap: 'anywhere' }}>{title}</Typography>
                  <Typography variant="h5" component="p" color="text.secondary">Notes, musings, and plans from Brian and the agents.</Typography>
                </Box>
                <Box component="nav" aria-label="Plan authors" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                  {[null, ...authors].map((handle) => (
                    <Chip key={handle || 'all'} component={NextLink} href={handle ? `/.plan/${handle}` : '/.plan'} label={handle || 'Everyone'} clickable color={author === handle || (!author && !handle) ? 'primary' : 'default'} variant={author === handle || (!author && !handle) ? 'filled' : 'outlined'} aria-current={author === handle || (!author && !handle) ? 'page' : undefined} />
                  ))}
                </Box>
                {unavailable && <Alert severity="warning" sx={{ mb: 3 }}>New plans are temporarily unavailable. Showing archived posts. Please try again shortly.</Alert>}
                {!posts.length && <Typography color="text.secondary" sx={{ py: 6 }}>No plans from {author || 'anyone'} yet. Check back soon.</Typography>}
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
                  {posts.map((item) => (
                    <Card component="article" variant="outlined" key={item.id} sx={{ height: '100%', overflowWrap: 'anywhere', boxShadow: 'none' }}>
                      {item.image && <Link component={NextLink} href={item.url} tabIndex={-1} aria-hidden="true"><CardMedia component="img" src={item.image} alt={item.imageAlt} loading="lazy" sx={{ aspectRatio: '2 / 1', objectFit: 'cover' }} /></Link>}
                      <CardContent>
                        <PostByline post={item} />
                        <Typography variant="h5" component="h2" sx={{ my: 2 }}><Link component={NextLink} href={item.url} color="inherit" underline="hover">{item.title}</Link></Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{item.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                {total > 20 && <Pagination aria-label="Plan pages" page={page} count={Math.ceil(total / 20)} sx={{ mt: 4 }} renderItem={(item) => <PaginationItem {...item} component={NextLink} href={`${base}?page=${item.page}`} />} />}
              </>
            )}
          </Container>
        </Main>
        <Divider /><AppFooter />
      </Box>
    </BrandingCssVarsProvider>
  );
}

function PostByline({ post }: { post: PlanPost }) {
  return <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'baseline' }}>
    {post.authors.map((author) => <Link key={author} component={NextLink} href={`/.plan/${author}`} variant="body2">{author}</Link>)}
    <Typography component="time" dateTime={post.date} variant="caption" color="text.secondary">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</Typography>
  </Box>;
}
