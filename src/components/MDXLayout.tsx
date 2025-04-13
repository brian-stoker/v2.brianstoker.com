import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import { MDXProvider } from '@mdx-js/react';

const components = {
  h1: (props: any) => <Typography variant="h1" {...props} sx={{ mt: 6, mb: 2 }} />,
  h2: (props: any) => <Typography variant="h2" {...props} sx={{ mt: 4, mb: 2 }} />,
  h3: (props: any) => <Typography variant="h3" {...props} sx={{ mt: 3, mb: 1.5 }} />,
  h4: (props: any) => <Typography variant="h4" {...props} sx={{ mt: 2, mb: 1 }} />,
  h5: (props: any) => <Typography variant="h5" {...props} sx={{ mt: 2, mb: 1 }} />,
  h6: (props: any) => <Typography variant="h6" {...props} sx={{ mt: 2, mb: 1 }} />,
  p: (props: any) => <Typography variant="body1" {...props} paragraph sx={{ my: 2 }} />,
  a: (props: any) => <a {...props} style={{ color: '#0072E5', textDecoration: 'none' }} />,
  ul: (props: any) => <ul {...props} style={{ marginBottom: '16px' }} />,
  li: (props: any) => <li {...props} style={{ marginBottom: '8px' }} />,
  blockquote: (props: any) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: '4px solid #ccc',
        pl: 2,
        my: 2,
        color: 'text.secondary',
      }}
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      {...props}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        padding: '3px 5px',
        borderRadius: '3px',
        fontFamily: 'monospace',
      }}
    />
  ),
  pre: (props: any) => (
    <Box
      component="pre"
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        p: 2,
        borderRadius: 1,
        overflow: 'auto',
        '& code': {
          backgroundColor: 'transparent',
          padding: 0,
        },
      }}
      {...props}
    />
  ),
};

interface MDXLayoutProps {
  children: React.ReactNode;
  frontMatter: {
    title: string;
    description: string;
    date: string;
    authors: string[];
    tags: string[];
  };
}

export default function MDXLayout({ children, frontMatter }: MDXLayoutProps) {
  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        {frontMatter.title}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {new Date(frontMatter.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        {frontMatter.tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>
      
      <Typography variant="subtitle1" paragraph sx={{ mb: 4 }}>
        {frontMatter.description}
      </Typography>
      
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </Container>
  );
} 