import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import generateRSSFeed from './generateRssFeed';

describe('generateRssFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testBlogPosts = [
    {
      title: 'Test Post 1',
      slug: 'test-post-1',
      date: new Date(),
      description: 'This is a test post.',
      image: `${__dirname}/static/logo.svg`,
      author: { name: 'Author Name' },
    },
    {
      title: 'Test Post 2',
      slug: 'test-post-2',
      date: new Date(),
      description: 'This is another test post.',
      image: `${__dirname}/static/logo.svg`,
      author: { name: 'Author Name' },
    },
  ];

  const testFeed = {
    title: 'Test Feed Title',
    description: 'Test Feed Description',
    id: 'https://stoked-ui.github.io/blog',
    link: 'https://stoked-ui.github.io/blog',
    language: 'en',
    image: `${__dirname}/static/logo.svg`,
    favicon: `${__dirname}/favicon.ico`,
    copyright: `Copyright ${new Date().getFullYear()} stoked-ui.github.io`,
    feedLinks: {
      rss2: 'https://stoked-ui.github.io/public/rss.xml',
    },
  };

  it('renders without crashing', () => {
    const { container } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    expect(container).toBeInTheDocument();
  });

  it('renders correct feed with valid props', async () => {
    const { getByText, getByAltText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    expect(getByText(testFeed.title)).toBeInTheDocument();
    expect(getByAltText(`${testFeed.image} logo`)).toBeInTheDocument();
  });

  it('renders correct feed with invalid props', async () => {
    const invalidFeed = Object.assign({}, testFeed, { title: null });
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    expect(getByText(invalidFeed.title)).not.toBeInTheDocument();
  });

  it('generates rss file on production environment', async () => {
    jest.spyOn(process.env, 'NODE_ENV').mockValue('production');
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    expect(getByText('Generating RSS feed')).toBeInTheDocument();
    await waitFor(() => expect(fs.existsSync(`public/rss.xml`)).toBe(true));
  });

  it('does not generate rss file on non-production environment', async () => {
    jest.spyOn(process.env, 'NODE_ENV').mockValue('development');
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    expect(getByText('Generating RSS feed')).toBeInTheDocument();
    await waitFor(() => expect(fs.existsSync(`public/rss.xml`)).toBe(false));
  });

  it('calls fs.mkdirSync method', async () => {
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    await waitFor(() => expect(getByText('Generating RSS feed')).toBeInTheDocument());
    await waitFor(() => expect(fs.mkdirSync).toHaveBeenCalledTimes(1));
  });

  it('calls fs.writeFileSync method', async () => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    await waitFor(() => expect(getByText('Generating RSS feed')).toBeInTheDocument());
    await waitFor(() => expect(fs.writeFileSync).toHaveBeenCalledTimes(1));
  });

  it('calls Feed rss2 method', async () => {
    jest.spyOn(testFeed, 'rss2').mockImplementation(() => 'test-rss-content');
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} />);
    await waitFor(() => expect(getByText('Generating RSS feed')).toBeInTheDocument());
    await waitFor(() => expect(testFeed.rss2).toHaveBeenCalledTimes(1));
  });

  it('calls generateRssFeed method', async () => {
    const generateRssFeedMock = jest.fn();
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} generateRssFeed={generateRssFeedMock} />);
    await waitFor(() => expect(generateRssFeedMock).toHaveBeenCalledTimes(1));
  });

  it('calls generateRssFeed method with correct arguments', async () => {
    const generateRssFeedMock = jest.fn();
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPosts} generateRssFeed={generateRssFeedMock} />);
    await waitFor(() => expect(generateRssFeedMock).toHaveBeenCalledTimes(1));
    expect(generateRssFeedMock).toHaveBeenCalledWith(testBlogPosts);
  });

  it('does not generate rss file if feedLinks is missing', async () => {
    const testBlogPostsWithMissingFeedLinks = [
      ...testBlogPosts,
      {
        feedLinks: null,
      },
    ];
    const { getByText } = render(<generateRSSFeed allBlogPosts={testBlogPostsWithMissingFeedLinks} />);
    await waitFor(() => expect(getByText('Generating RSS feed')).toBeInTheDocument());
    await waitFor(() => expect(fs.existsSync(`public/rss.xml`)).toBe(false));
  });
});