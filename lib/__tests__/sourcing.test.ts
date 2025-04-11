import React from 'react';
import { render } from '@testing-library/react';
import BlogPost from './BlogPost';
import getHeaders from '@stoked-ui/docs-markdown';
import fs from 'fs';
import path from 'path';

describe('Blog Post', () => {
  const blogMuiDir = path.join(process.cwd(), 'pages/blog/mui');
  const blogDir = path.join(process.cwd(), 'pages/blog/mui');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(() => render(<BlogPost />)).not.toThrow();
  });

  describe('getBlogFilePaths', () => {
    it('returns an array of file paths', async () => {
      const filePaths = getBlogFilePaths();
      expect(filePaths).toBeInstanceOf(Array);
    });

    it('filters by extension', async () => {
      fs.readdirSync = jest.fn().mockReturnValue([
        'file1.md',
        'file2',
        '.hiddenFile',
      ]);

      const filePaths = getBlogFilePaths('.md');
      expect(filePaths).toEqual(['file1.md']);
    });
  });

  describe('getBlogPost', () => {
    it('returns a blog post object', async () => {
      const filePath = 'file1.md';
      fs.readFileSync = jest.fn().mockReturnValue('content');
      getHeaders = jest.fn(() => ({ title: 'title' }));

      const result = getBlogPost(filePath);
      expect(result).toEqual({ slug: 'file1', description: 'content', title: 'title' });
    });

    it('throws an error if file does not exist', async () => {
      fs.readFileSync = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      await expect(getBlogPost('nonExistentFile.md')).rejects.toThrowError();
    });
  });

  describe('getAllBlogPosts', () => {
    it('returns an array of blog posts', async () => {
      const filePaths = getBlogFilePaths();
      fs.readFileSync = jest.fn().mockReturnValue('content');
      getHeaders = jest.fn(() => ({ title: 'title' }));

      const result = getAllBlogPosts();
      expect(result.allBlogPosts).toBeInstanceOf(Array);
    });

    it('filters by date', async () => {
      const filePaths = getBlogFilePaths();
      fs.readFileSync = jest.fn().mockReturnValue('content');
      getHeaders = jest.fn(() => ({ title: 'title' }));

      const result = getAllBlogPosts();
      expect(result.allBlogPosts).toHaveLength(1);
    });

    it('throws an error if tag is not whitelisted', async () => {
      fs.readFileSync = jest.fn().mockReturnValue('content');
      getHeaders = jest.fn(() => ({ title: 'title' }));

      const result = getAllBlogPosts();
      expect(() => result.allBlogPosts[0].tags[1]).toThrowError();
    });
  });

  describe('BlogPost component', () => {
    it('renders correctly with valid props', async () => {
      const post = { title: 'title', description: 'content' };
      const { container } = render(<BlogPost {...post} />);
      expect(container).toHaveTextContent(post.title);
      expect(container).toHaveTextContent(post.description);
    });

    it('renders correctly with invalid props', async () => {
      const post = { title: undefined, description: 'content' };
      const { container } = render(<BlogPost {...post} />);
      expect(container).not.toHaveTextContent(post.title);
    });
  });
});