import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { getHeaders, getBlogFilePaths } from '@stoked-ui/docs-markdown';
import BlogPosts from './source/BlogPosts';

const blogMuiDir = path.join(process.cwd(), 'pages/blog/mui');
const blogDir = path.join(process.cwd(), 'pages/blog/mui');

describe('BlogPosts component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<BlogPosts />);
    expect(container).toBeInTheDocument();
  });

  describe('getBlogFilePaths', () => {
    it('returns an array of file paths for mui blog posts', async () => {
      const filePaths = getBlogFilePaths('.md');
      expect(filePaths).toEqual([]);
    });

    it('returns an array of file paths for sui blog posts', async () => {
      const filePaths = getBlogFilePaths('_md');
      expect(filePaths).toEqual([]);
    });

    it('concatenates mui and sui blog post file paths', async () => {
      const filePaths = getBlogFilePaths();
      expect(filePaths).not.toEqual([]);
    });
  });

  describe('getBlogPost', () => {
    it('returns a blog post object with correct properties', async () => {
      const filePath = path.join(blogDir, 'test.md');
      const blogPost = getBlogPost(filePath);
      expect(blogPost.slug).toBe('test');
      expect(blogPost.title).toBe('');
      expect(blogPost.description).toBe('');
    });

    it('throws an error if file does not exist', async () => {
      const filePath = path.join(blogDir, 'non-existent.md');
      expect(getBlogPost(filePath)).toThrowError();
    });
  });

  describe('getAllBlogPosts', () => {
    it('returns all blog posts with correct properties', async () => {
      const allBlogPosts = getAllBlogPosts();
      expect(allBlogPosts.allBlogPosts).toHaveLength(0);
    });

    it('filters out blog posts without a title', async () => {
      const allBlogPosts = getAllBlogPosts();
      expect(allBlogPosts.allBlogPosts).toHaveLength(1);
    });

    it('counts occurrences of each tag', async () => {
      const allBlogPosts = getAllBlogPosts();
      expect(allBlogPosts.tagInfo['Stoked UI']).toBeGreaterThan(0);
      expect(allBlogPosts.tagInfo['MUI X']).toBeGreaterThan(0);
    });
  });

  describe('component interactions', () => {
    it('calls getHeaders with correct content when filtering posts by tag', async () => {
      const filteredPosts = getAllBlogPosts();
      expect(getHeaders(filteredPosts.allBlogPosts[0].description)).not.toBeNull();
    });

    it('filters blog posts by keyword', async () => {
      const filteredPosts = getAllBlogPosts().then((posts) => render(<BlogPosts posts={posts.allBlogPosts} />));
      await waitFor(() => filteredPosts);
      expect(filteredPosts).toHaveTextContent('test');
    });
  });
});