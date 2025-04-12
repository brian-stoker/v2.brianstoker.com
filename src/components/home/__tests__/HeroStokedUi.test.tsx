import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Hero from './Hero';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { createMockTheme, createMockMediaQueryContextValue } from './mocks';

describe('Hero component', () => {
  const mockTheme = createMockTheme();
  const mediaQueryContextValue = createMockMediaQueryContextValue();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(<ThemeProvider theme={mockTheme}> <Hero /> </ThemeProvider>);
    expect(screen).not.toThrowError();
  });

  describe('props', () => {
    const props = { linearGradient: true, left: {} };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders with valid props', async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <Hero {...props} />
        </ThemeProvider>
      );
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(/Stoked UI/)).toBeInTheDocument();
    });

    it('throws error when linearGradient prop is false', async () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      render(<Hero {...props} linearGradient={false} />);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional rendering', () => {
    it('renders FileExplorerGrid when isMdUp prop is true', async () => {
      const mockMediaQueryContextValue = createMockMediaQueryContextValue();
      const { getByText } = render(
        <ThemeProvider theme={mockTheme}>
          <Hero mediaQueryContextValue={mockMediaQueryContextValue} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI')).toBeInTheDocument();
    });

    it('does not render FileExplorerGrid when isMdUp prop is false', async () => {
      const mockMediaQueryContextValue = createMockMediaQueryContextValue();
      const { queryByText } = render(
        <ThemeProvider theme={mockTheme}>
          <Hero mediaQueryContextValue={mockMediaQueryContextValue} />
        </ThemeProvider>
      );
      expect(queryByText('Stoked UI')).not.toBeInTheDocument();
    });

    it('renders FileExplorerDnd when isMdUp prop is true', async () => {
      const mockMediaQueryContextValue = createMockMediaQueryContextValue();
      render(
        <ThemeProvider theme={mockTheme}>
          <Hero mediaQueryContextValue={mockMediaQueryContextValue} />
        </ThemeProvider>
      );
      const fileExplorerDndElement = screen.getByRole('gridcell');
      expect(fileExplorerDndElement).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks the GetStartedButtons primaryLabel', async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <Hero />
        </ThemeProvider>
      );
      const getStartedButton = screen.getByRole('button');
      fireEvent.click(getStartedButton);
      expect(screen.getByText('/sui/components')).toBeInTheDocument();
    });

    it('clicks the link in GetStartedButtons primaryLabel', async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <Hero />
        </ThemeProvider>
      );
      const getStartedLink = screen.getByRole('link');
      fireEvent.click(getStartedLink);
      expect(screen.getByText('/sui/components')).toBeInTheDocument();
    });
  });

  describe('side effects or state changes', () => {
    it('calls the getTheme hook when component mounts', async () => {
      render(
        <ThemeProvider theme={mockTheme}>
          <Hero />
        </ThemeProvider>
      );
      const globalTheme = useTheme;
      expect(globalTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(
        <ThemeProvider theme={mockTheme}>
          <Hero />
        </ThemeProvider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});