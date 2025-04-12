import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Hero from './Hero';
import { createLoading } from './Hero';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({ breakpoints: { up: { md: true } } }),
}));

describe('Hero component', () => {
  const sx = { width: '100%', height: 280 };
  const theme = { applyDarkStyles: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(<Hero />);
    expect(screen.getByText(/Components yoink'/)).toBeInTheDocument();
  });

  it('renders gradient text component', async () => {
    render(<Hero />);
    const gradientText = screen.getByRole('text');
    expect(gradientText).toHaveStyle({
      color: 'primaryDark.800',
    });
  });

  describe('right prop', () => {
    it('renders Stack with EditorHero when md up', async () => {
      render(
        <Hero
          linearGradient
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
              {/* ... */}
            </Box>
          }
          rightSx={{
            p: 4,
            ml: 2,
            minWidth: 2000,
            overflow: 'hidden',
          }}
        />,
      );
      const editorHero = screen.getByRole('img');
      expect(editorHero).toBeInTheDocument();
    });

    it('does not render Stack with EditorHero when md down', async () => {
      render(
        <Hero
          linearGradient
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
              {/* ... */}
            </Box>
          }
          rightSx={{
            p: 4,
            ml: 2,
            minWidth: 2000,
            overflow: 'hidden',
          }}
        />,
      );
      expect(screen.getByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('GetStartedButtons prop', () => {
    it('renders GetStartedButtons with primary label and url', async () => {
      render(<Hero />);
      const getStartedButtons = screen.getByText(/Checkout the roadmap/);
      expect(getStartedButtons).toHaveAttribute('href', 'https://github.com/orgs/stoked-ui/projects/1/views/1');
    });

    it('renders GetStartedButtons with invalid url', async () => {
      render(<Hero />);
      const getStartedButtons = screen.getByText(/Checkout the roadmap/);
      expect(getStartedButtons).toHaveAttribute('href', '/invalid/url');
    });
  });

  describe('useMediaQuery hook', () => {
    it('returns true when md up', async () => {
      render(
        <Hero
          linearGradient
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
              {/* ... */}
            </Box>
          }
          rightSx={{
            p: 4,
            ml: 2,
            minWidth: 2000,
            overflow: 'hidden',
          }}
        />,
      );
      const isMdUp = useMediaQuery({ up: { md: true } });
      expect(isMdUp).toBe(true);
    });

    it('returns false when md down', async () => {
      render(
        <Hero
          linearGradient
          left={
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 500 }}>
              {/* ... */}
            </Box>
          }
          rightSx={{
            p: 4,
            ml: 2,
            minWidth: 2000,
            overflow: 'hidden',
          }}
        />,
      );
      const isMdUp = useMediaQuery({ up: { md: true } });
      expect(isMdUp).toBe(false);
    });
  });

  describe('createLoading function', () => {
    it('returns a loading component with sx prop', async () => {
      render(createLoading(sx));
      expect(screen.getByRole('presentation')).toHaveStyle({
        width: '100%',
        height: 280,
      });
    });
  });
});