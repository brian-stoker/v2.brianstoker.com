import { render, screen } from '@testing-library/react';
import HeroEnd from './HeroEnd';
import '@mui/material/styles';
import { alpha } from '@mui/material/styles';

describe('HeroEnd Component', () => {
  beforeEach(() => {
    // Reset mocks
  });

  afterEach(() => {
    // Clean up mocks
  });

  it('renders without crashing', async () => {
    render(<HeroEnd />);
    expect(screen.getByTestId('hero-end')).toBeInTheDocument();
  });

  describe('Conditional Rendering', () => {
    it('renders placeholder when not in view', async () => {
      render(<HeroEnd />);
      expect(screen.getByRole('region')).toHaveStyle({
        height: { xs: 616 - 48 * 2, sm: 438 - 80 * 2, md: 461 - 96 * 2 },
      });
    });

    it('renders StartToday when in view', async () => {
      render(<HeroEnd />);
      const startToday = screen.getByTestId('start-today');
      expect(startToday).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('throws an error for invalid bg prop', async () => {
      const wrapper = render(<HeroEnd bg="invalid" />);
      expect(screen.getByTestId('hero-end')).toHaveError('Invalid background color');
    });

    it('does not throw an error for valid bg prop', async () => {
      render(<HeroEnd bg="transparent" />);
    });
  });

  describe('User Interactions', () => {
    it('calls inView callback when in view', async () => {
      const inViewCallback = jest.fn();
      const wrapper = render(<HeroEnd onInView={inViewCallback} />);
      await screen.findByRole('region');
      expect(inViewCallback).toHaveBeenCalledTimes(1);
    });

    it('does not call inView callback when not in view', async () => {
      const inViewCallback = jest.fn();
      const wrapper = render(<HeroEnd onInView={inViewCallback} />);
      await screen.findByRole('region');
      await Promise.resolve();
      expect(inViewCallback).not.toHaveBeenCalled();
    });
  });

  describe('Side Effects', () => {
    it('applies dark styles when in view', async () => {
      const wrapper = render(<HeroEnd />);
      await screen.findByRole('region');
      expect(screen.getByTestId('hero-end')).toHaveStyle({
        background: `linear-gradient(180deg, ${alpha(
          HeroEnd.darkThemeColor,
        )} 50%, ${
          HeroEnd.lightThemeColor
        } 100%)`,
      });
    });

    it('does not apply dark styles when not in view', async () => {
      const wrapper = render(<HeroEnd />);
      await screen.findByRole('region');
      expect(screen.getByTestId('hero-end')).toHaveStyle({
        background: `linear-gradient(180deg, #FFF 50%, ${alpha(
          HeroEnd.darkThemeColor,
        )} 100%)`,
      });
    });
  });

  it('renders snapshot', async () => {
    const wrapper = render(<HeroEnd />);
    await screen.findByRole('region');
    expect(screen.getByTestId('hero-end')).toMatchSnapshot();
  });
});