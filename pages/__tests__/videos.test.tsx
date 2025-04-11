import { render, fireEvent, waitFor } from '@testing-library/react';
import VideoGallery from './VideoGallery';
import { ILightGallery, LightGallery as ILightGalleryWithRef } from 'lightgallery/lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';

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
  // Add more video objects as needed
];

describe('VideoGallery component', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="header"></div>
      <div ref={setGalleryContainer} class="inline-gallery-container"></div>
    `;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<VideoGallery name="test" />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders gallery when videos prop is provided', () => {
      const { container, getByText } = render(<VideoGallery name="test" videos={videos} />);
      expect(getByText('Normal Guy')).toBeInTheDocument();
    });

    it('does not render gallery when no videos prop is provided', () => {
      const { container } = render(<VideoGallery name="test" />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error when name prop is missing', () => {
      const { error } = render(<VideoGallery />, { throwError: true });
      expect(error).toHaveMessage('name is required');
    });

    it('throws error when videos prop is missing', () => {
      const { error } = render(<VideoGallery name="test" />);
      expect(error).toHaveMessage('videos is required');
    });
  });

  describe('user interactions', () => {
    it('opens gallery when click button', async () => {
      const lightGalleryRef = createLightGalleryMock();
      const { getByText } = render(<VideoGallery name="test" videos={videos} />);
      await waitFor(() => getByText('Normal Guy'));
      fireEvent.click(getByText('Open Gallery'));
      expect(lightGalleryRef).toBeInstanceOf(ILightGallery);
    });

    it('resizes gallery when input changes', async () => {
      const lightGalleryRef = createLightGalleryMock();
      const { getByText } = render(<VideoGallery name="test" videos={videos} />);
      await waitFor(() => getByText('Normal Guy'));
      fireEvent.change(getByText('Thumb Width'), { target: { value: '100' } });
      expect(lightGalleryRef.thumbs().width()).toBe(100);
    });

    it('submits form when click submit', async () => {
      const lightGalleryRef = createLightGalleryMock();
      const { getByText, getByRole } = render(<VideoGallery name="test" videos={videos} />);
      await waitFor(() => getByText('Normal Guy'));
      fireEvent.click(getByText('Open Gallery'));
      const form = getByRole('form');
      fireEvent.submit(form);
    });
  });

  describe('side effects', () => {
    it('renders gallery container when effect runs', async () => {
      createLightGalleryMock();
      await waitFor(() => document.querySelector('.inline-gallery-container'));
    });
  });

  function createLightGalleryMock() {
    return {
      show: jest.fn(),
      open: jest.fn(),
      thumbs: () => ({ width: 100 }),
    };
  }
});