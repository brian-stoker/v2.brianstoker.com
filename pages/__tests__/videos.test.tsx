import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import VideoGallery from './VideoGallery';

const videos = [
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

describe('VideoGallery component', () => {
  const HeaderComponent = () => (
    <div className="header">
      <h1 className="header__title">lightGallery - Inline Gallery</h1>
      <p className="header__description">
        lightGallery is a feature-rich, modular JavaScript gallery plugin for
        building beautiful image and video galleries for the web and the mobile
      </p>
      <p className="header__description2">
        With lightGallery you can create both inline and lightBox galleries. You
        can create inline gallery by passing the container element via container
        option. All the lightBox features are available in inline gallery as well.
        inline gallery can be converted to the lightBox gallery by clicking on the
        maximize icon on the toolbar
      </p>
      <a
        className="header__button"
        href="https://github.com/sachinchoolur/lightGallery"
        target="_blank"
      >
        View on GitHub
      </a>
    </div>
  );

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<VideoGallery name="test" />);
    expect(container).toBeInTheDocument();
  });

  it('renders with correct thumbnail and subHtml', async () => {
    const { getByText, getByRole } = render(<VideoGallery name="test" />);
    await waitFor(() => getByText('Normal Guy'));
    expect(getByText('Normal Guy')).toHaveAttribute('src', 'https://cenv-public.s3.amazonaws.com/normal-guy.mov');
  });

  it('opens gallery on init', async () => {
    const { getByRole } = render(<VideoGallery name="test" />);
    await waitFor(() => getByText('Normal Guy'));
    expect(getByRole('button')).toHaveClass('lg-item__zoom-icon');
  });

  it('closes gallery when minimized', async () => {
    const { getByRole, getByText } = render(<VideoGallery name="test" />);
    await waitFor(() => getByText('Normal Guy'));
    const minimizeButton = getByRole('button');
    fireEvent.click(minimizeButton);
    expect(getByText('Normal Guy')).not.toBeInTheDocument();
  });

  it('updates gallery container on render', async () => {
    document.body.innerHTML = '<div id="container" class="inline-gallery-container"></div>';
    const { getByClass, getByText } = render(<VideoGallery name="test" />);
    await waitFor(() => getByClass('lg-item'));
    expect(getByClass('inline-gallery-container')).toHaveAttribute('class', 'lg-item__thumb');
  });

  it('throws error when invalid container prop is passed', () => {
    const { error } = render(<VideoGallery name="test" container={<div wrong prop="wrong value" />} />);
    expect(error).toBeInstanceOf(Error);
  });
});