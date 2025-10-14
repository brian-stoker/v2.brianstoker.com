import * as React from "react";
import type { MDXComponents } from "mdx/types";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <Typography variant="h1" sx={{ mt: 6, mb: 2 }}>{children}</Typography>,
    h2: ({ children }) => <Typography variant="h2" sx={{ mt: 4, mb: 2 }}>{children}</Typography>,
    h3: ({ children }) => <Typography variant="h3" sx={{ mt: 3, mb: 1.5 }}>{children}</Typography>,
    h4: ({ children }) => <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
    h5: ({ children }) => <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
    h6: ({ children }) => <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{children}</Typography>,
    p: ({ children }) => <Typography variant="body1" paragraph sx={{ my: 2 }}>{children}</Typography>,
    a: ({ href, children }) => (
      <Link
        href={href as string}
        style={{ color: '#0072E5', textDecoration: 'none' }}
        className="mdx-link">
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <Box
        component="blockquote"
        sx={{
          borderLeft: '4px solid #ccc',
          pl: 2,
          my: 2,
          color: 'text.secondary',
        }}
      >
        {children}
      </Box>
    ),
    code: ({ children }) => (
      <code
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          padding: '3px 5px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}
      >
        {children}
      </code>
    ),
    ...components,
  };
}