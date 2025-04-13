import * as React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { Link } from '@stoked-ui/docs/Link';
import AppHeader from 'src/layouts/AppHeader';
import AppFooter from 'src/layouts/AppFooter';
import {BlogPost, getAllBlogPosts} from "../../lib/sourcing";
import generateRssFeed from "../../scripts/generateRSSFeed";
// Import all the blog post metadata
// Add more imports as you create more blog posts


export const getStaticProps = async () => {
  const data = await getAllBlogPosts();
  generateRssFeed(data.allBlogPosts);
  return {
    props: data,
  };
};

export default function PlanIndex(props) {
  const router = useRouter();
  const posts = props.allBlogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <Head>
        <title>The Plan | Brian Stoker</title>
        <meta 
          name="description" 
          content="Plans, roadmaps, and thoughts about the future." 
        />
      </Head>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            The Plan
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary">
            Plans, roadmaps, and thoughts about the future.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} lg={4} key={post.slug}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="overline" color="text.secondary">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                  
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    <Link
                      href={`/.plan/${post.slug}`}
                      sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {post.title}
                    </Link>
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {post.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                    {post.tags.length > 3 && (
                      <Chip 
                        label={`+${post.tags.length - 3} more`} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <AppFooter />
    </>
  );
} 