import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import HomeView from './index';
import useWindowWidth from '../hooks/useWindowSize';
import { Document, Page } from 'react-pdf';

describe('HomeView component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<HomeView />);
    expect(container).toBeInTheDocument();
  });

  it('renders video gallery with correct data', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(0);

    const { getByText, getByRole } = render(<HomeView HomeMain={HomeView} />);
    expect(getByText('drums')).toBeInTheDocument();
    expect(getByRole('img', { name: 'normal guy' })).toBeInTheDocument();
  });

  it('renders correct video thumbnails and titles', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
      {
        src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
        thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
        title: 'Golden Stream',
      },
    ];

    const { getByRole, getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(2);
    expect(getAllByRole('img')[0]).toHaveAttribute('src', videos[0].thumb);
    expect(getAllByRole('img')[1]).toHaveAttribute('src', videos[1].thumb);
  });

  it('renders correct video content with subHtml', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
      },
    ];

    const { getByRole, getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(1);
    expect(getAllByRole('img')[0]).toHaveAttribute('src', videos[0].thumb);
    expect(getAllByRole('img')[0]).toHaveTextContent(videos[0].subHtml);
  });

  it('renders correct video title', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
    ];

    const { getByText, getAllByText } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getByText('Normal Guy')).toBeInTheDocument();
  });

  it('renders correct video list', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
      {
        src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
        thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
        title: 'Golden Stream',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(2);
  });

  it('renders correct video list with pagination', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
      {
        src: 'https://cenv-public.s3.amazonaws.com/golden-stream.mp4',
        thumb: 'https://cenv-public.s3.amazonaws.com/golden-stream.png',
        title: 'Golden Stream',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(2);
  });

  it('renders correct video content when all videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(1);
  });

  it('renders correct video content when some videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(1);
  });

  it('renders correct video content when no videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(0);
  });

  it('calls video callback when all videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
      },
    ];

    const callback = jest.fn();
    render(<HomeView HomeMain={HomeView} videos={videos} onVideoLoaded={callback} />);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls video callback when some videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        subHtml: `<h4>'Normal Guy' by Chase, Anthony, and Derp</h4>`,
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
      },
    ];

    const callback = jest.fn();
    render(<HomeView HomeMain={HomeView} videos={videos} onVideoLoaded={callback} />);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls video callback when no videos are loaded', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const callback = jest.fn();
    render(<HomeView HomeMain={HomeView} videos={[]} onVideoLoaded={callback} />);
    expect(callback).not.toHaveBeenCalled();
  });

  it('renders correct video list with infinite scrolling', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(1);
  });

  it('renders correct video list with loading animation', async () => {
    const useWindowWidthMock = jest.fn(() => (0, _useWindowSize.default)());
    useWindowWidth.mockReturnValue(100);

    const videos = [
      {
        src: 'https://cenv-public.s3.amazonaws.com/normal-guy.mov',
        thumb: 'https://cenv-public.s3.amazonaws.com/normal-guy.png',
        title: 'Normal Guy',
      },
    ];

    const { getAllByRole } = render(<HomeView HomeMain={HomeView} videos={videos} />);
    expect(getAllByRole('img')).toHaveLength(1);
  });
});