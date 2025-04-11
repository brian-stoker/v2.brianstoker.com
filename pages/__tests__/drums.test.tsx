import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './index';
import Card from '@mui/material/Card';
import Button from '@mui/base/Button';

const mockVideos = [
  {
    src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
    subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png'
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
    thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
    subHtml: `<h4>'Golden Stream' by Chase, Anthony, and Derp</h4>`,
  },
  {
    src: 'https://cenv-public.s3.amazonaws.com/tell-me-mister-2.mp4',
    subHtml: `<h4>'Tell Me Mister' by Chase, Anthony, and Derp</h4>`,
    thumb: 'https://cenv-public.s3.amazonaws.com/tell-me-mister.png',
  },
];

describe('HomeView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<HomeView />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders video gallery component when provided videos prop is truthy', () => {
      const { getByText } = render(<HomeView HomeMain={MainView} videos={mockVideos} />);
      expect(getByText('Normal Guy')).toBeInTheDocument();
    });

    it('renders default content when videos prop is falsy', () => {
      const { getByText } = render(<HomeView HomeMain={MainView} videos={null} />);
      expect(getByText('No videos available')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when provided videos prop is not an array', () => {
      expect(() => <HomeView HomeMain={MainView} videos='not an array' />).toThrowError(
        'videos prop must be an array',
      );
    });
  });

  describe('user interactions', () => {
    it('calls onVideoClick when a video is clicked', async () => {
      const onVideoClick = jest.fn();
      const { getByText, click } = render(<HomeView HomeMain={MainView} videos={mockVideos} />);
      fireEvent.click(getByText('Normal Guy'));
      await waitFor(() => expect(onVideoClick).toHaveBeenCalledTimes(1));
    });

    it('calls onVideoChange when a video is changed', async () => {
      const onVideoChange = jest.fn();
      const { getByText, click } = render(<HomeView HomeMain={MainView} videos={mockVideos} />);
      fireEvent.click(getByText('Normal Guy'));
      expect(onVideoChange).toHaveBeenCalledTimes(0);
      fireEvent.change(getByText('Title'), { target: { value: 'New Title' } });
      await waitFor(() => expect(onVideoChange).toHaveBeenCalledTimes(1));
    });

    it('submits the form when the submit button is clicked', async () => {
      const onSubmit = jest.fn();
      const { getByText, submit } = render(<HomeView HomeMain={MainView} videos={mockVideos} />);
      fireEvent.click(getByText('Submit'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });
  });

  it('calls onVideoDelete when a video is deleted', async () => {
    const onVideoDelete = jest.fn();
    const { getByText, click } = render(<HomeView HomeMain={MainView} videos={mockVideos} />);
    fireEvent.click(getByText('Delete'));
    await waitFor(() => expect(onVideoDelete).toHaveBeenCalledTimes(1));
  });
});