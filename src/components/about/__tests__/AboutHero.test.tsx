import { render, fireEvent, waitFor } from '@testing-library/react';
import AboutHero from './AboutHero';

const teamPhotos = [
  {
    img: '/static/branding/about/group-photo/aristocrat.png',
    title: '',
  },
  {
    img: 'https://cenv-public.s3.amazonaws.com/phaser-lock.gif',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/texas-auto.png',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/argos-health.png',
    title: '',
  },
  {
    img: 'https://stokedconsulting.com/img/map_health.jpg',
    title: '',
  },
];

const ImageContainer = {
  style: () => ({
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  }),
};

const Image = {
  style: ({ theme }) => ({
    width: 400,
    height: 300,
    boxSizing: 'content-box',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: `0px 2px 8px ${theme.palette.grey[200]}`,
    transition: 'all 100ms ease',
    ...theme.applyDarkStyles({
      borderColor: theme.palette.primaryDark[600],
      boxShadow: `0px 2px 8px ${theme.palette.common.black}`,
    }),
  }),
};

describe('AboutHero component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<AboutHero />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders photo gallery when enabled', async () => {
      const { getByText, queryByText } = render(<AboutHero />);
      expect(getByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(queryByText('Photo Gallery')).not.toBeInTheDocument();
      const photoGalleryElement = getByText('Photo Gallery');
      expect(photoGalleryElement).toBeInTheDocument();
    });

    it('does not render photo gallery when disabled', async () => {
      const { queryByText, queryByTitle } = render(<AboutHero photoGallery={false} />);
      expect(queryByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(queryByTitle('Photo Gallery')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error when teamPhotos is undefined', async () => {
      const { getByText } = render(<AboutHero teamPhotos={undefined} />);
      await waitFor(() => expect(getByText('It was high time we contribute to the')).toBeInTheDocument());
      expect(getByText('Error: teamPhotos prop is required')).toBeInTheDocument();
    });

    it('throws error when teamPhotos is not an array', async () => {
      const { getByText } = render(<AboutHero teamPhotos={1} />);
      await waitFor(() => expect(getByText('It was high time we contribute to the')).toBeInTheDocument());
      expect(getByText('Error: teamPhotos prop must be an array')).toBeInTheDocument();
    });

    it('throws error when teamPhotos has no images', async () => {
      const { getByText } = render(<AboutHero teamPhotos={[]} />);
      await waitFor(() => expect(getByText('It was high time we contribute to the')).toBeInTheDocument());
      expect(getByText('Error: at least one image is required in teamPhotos prop')).toBeInTheDocument();
    });
  });

  describe('photo gallery props', () => {
    it('renders photo gallery with loading attribute', async () => {
      const { getByText, queryByText } = render(<AboutHero teamPhotos={teamPhotos} loading="lazy" />);
      expect(getByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(queryByText('Photo Gallery')).not.toBeInTheDocument();
    });

    it('renders photo gallery with fetchPriority attribute', async () => {
      const { getByText, queryByText } = render(<AboutHero teamPhotos={teamPhotos} fetchPriority="high" />);
      expect(getByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(queryByText('Photo Gallery')).not.toBeInTheDocument();
    });
  });

  describe('photo gallery elements', () => {
    it('renders photo gallery elements with correct alt text', async () => {
      const { getByText } = render(<AboutHero teamPhotos={teamPhotos} />);
      expect(getByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(getByText(teamPhotos[0].title)).toBeInTheDocument();
      expect(getByText(teamPhotos[1].title)).toBeInTheDocument();
      expect(getByText(teamPhotos[2].title)).toBeInTheDocument();
    });
  });

  describe('team statistics', () => {
    it('renders team statistics', async () => {
      const { getByText } = render(<AboutHero />);
      expect(getByText('It was high time we contribute to the')).toBeInTheDocument();
      expect(getByText('Our goal is to provide open source components that will enable the community to build sophisticated media tools easily.')).toBeInTheDocument();
    });
  });
});