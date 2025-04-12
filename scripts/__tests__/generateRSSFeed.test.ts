import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import generateRSSFeed from './generateRSSFeed';

describe('generateRSSFeed component', () => {
  let allBlogPosts: BlogPost[];
  let siteUrl: string;
  let feedLinks: any;

  beforeEach(() => {
    allBlogPosts = [
      { slug: 'post-1', title: 'Post 1' },
      { slug: 'post-2', title: 'Post 2' },
    ];

    siteUrl = 'https://stoked-ui.github.io';
    feedLinks = { rss2: `${siteUrl}/public${ROUTES.rssFeed}` };
  });

  it('renders without crashing', async () => {
    render(<generateRSSFeed allBlogPosts={allBlogPosts} />);
    expect(document.body).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders title and description when in production environment', async () => {
      process.env.NODE_ENV = 'production';
      const { getByText } = render(<generateRSSFeed allBlogPosts={allBlogPosts} />);
      expect(getByText('brian-stokerblog')).toBeInTheDocument();
      expect(getByText('find out what i\'m working on but probably just random bs that you aren\'t interested in.')).toBeInTheDocument();
    });

    it('does not render title and description when in non-production environment', async () => {
      process.env.NODE_ENV = 'development';
      const { queryByText } = render(<generateRSSFeed allBlogPosts={allBlogPosts} />);
      expect(queryByText('brian-stokerblog')).not.toBeInTheDocument();
      expect(queryByText('find out what i\'m working on but probably just random bs that you aren\'t interested in.')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates allBlogPosts prop as array of BlogPost type', () => {
      const invalidAllBlogPosts = [{ slug: 'post-1' }];
      expect(() => generateRSSFeed(allBlogPosts, { invalidProp: undefined })).not.toThrow();
    });

    it('throws an error when allBlogPosts is not an array', async () => {
      process.env.NODE_ENV = 'production';
      const { threwError } = render(<generateRSSFeed allBlogPosts='invalid', feedLinks={feedLinks} />);
      expect(threwError).toBeInstanceOf(Error);
    });
  });

  describe('user interactions', () => {
    it('calls generateRssFeed function when clicked', async () => {
      const mockGenerateRssFeed = jest.fn();
      const { getByText } = render(<generateRSSFeed allBlogPosts={allBlogPosts} generateRssFeed={mockGenerateRssFeed} />);
      expect(mockGenerateRssFeed).not.toHaveBeenCalled();

      fireEvent.click(getByText('Call Generate RSS Feed'));
      await waitFor(() => expect(mockGenerateRssFeed).toHaveBeenCalledTimes(1));
    });

    it('calls generateRssFeed function when form is submitted', async () => {
      const mockGenerateRssFeed = jest.fn();
      const { getByText, getByRole } = render(<generateRSSFeed allBlogPosts={allBlogPosts} generateRssFeed={mockGenerateRssFeed} />);
      expect(mockGenerateRssFeed).not.toHaveBeenCalled();

      fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
      fireEvent.submit(getByText('Call Generate RSS Feed'));
      await waitFor(() => expect(mockGenerateRssFeed).toHaveBeenCalledTimes(1));
    });
  });

  describe('side effects', () => {
    it('creates directory and writes file when generateRssFeed function is called', async () => {
      const fsMock = jest.spyOn(require('fs'), 'mkdirSync').mockImplementation(() => Promise.resolve());
      const fsWriteFileSyncMock = jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(() => Promise.resolve());

      render(<generateRSSFeed allBlogPosts={allBlogPosts} />);
      expect(fsMock).toHaveBeenCalledTimes(1);
      expect(fsWriteFileSyncMock).toHaveBeenCalledTimes(1);
    });
  });

  it('matches snapshot when in production environment', async () => {
    process.env.NODE_ENV = 'production';
    const { asFragment } = render(<generateRSSFeed allBlogPosts={allBlogPosts} />);
    expect(asFragment()).toMatchSnapshot();
  });
});