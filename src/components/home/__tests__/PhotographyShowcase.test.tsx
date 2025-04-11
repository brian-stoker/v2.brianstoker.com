import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme, useTheme } from '@mui/material/styles';
import { Box, Button, HighlightedCode, MarkdownElement, MaterialDesignDemo, ShowcaseContainer, PointerContainer, StylingInfo, FlashCode } from 'src/components/home';
import { Data } from 'src/components/home/ElementPointer';

const lineMapping: Record<string, number | number[]> = {
  card: [0, 20],
  cardmedia: [1, 5],
  stack: [6, 19],
  stack2: [7, 16],
  typography: 8,
  stack3: [9, 16],
  chip: [10, 14],
  rating: 15,
  switch: 18,
};

describe('CoreShowcase', () => {
  it('renders without crashing', async () => {
    const theme = createTheme();
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(container).toMatchSnapshot();
  });

  describe('Conditional Rendering', () => {
    it('renders preview correctly', async () => {
      const theme = createTheme();
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase preview />
        </ThemeProvider>
      );
      expect(getByText('Material Design')).toBeInTheDocument();
    });

    it('renders code correctly', async () => {
      const theme = createTheme();
      const { getByText, getByAltText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      expect(getByText('Custom Theme')).toBeInTheDocument();
      expect(getByAltText('wild eyes')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('calls onClick event when button is clicked', async () => {
      const theme = createTheme();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );
      const materialDesignButton = getByText('Material Design');
      fireEvent.click(materialDesignButton);
      expect(getByRole('button')).toHaveAttribute('aria-label', 'Toggle Material Design');
    });

    it('calls onClick event when custom theme button is clicked', async () => {
      const theme = createTheme();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      const customThemeButton = getByText('Custom Theme');
      fireEvent.click(customThemeButton);
      expect(getByRole('button')).toHaveAttribute('aria-label', 'Toggle Custom Theme');
    });

    it('updates customized state when theme button is clicked', async () => {
      const theme = createTheme();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      const customThemeButton = getByText('Custom Theme');
      fireEvent.click(customThemeButton);
      expect(getByText('Custom Theme')).toBeInTheDocument();
    });
  });

  describe('Code Rendering', () => {
    it('renders highlighted lines correctly', async () => {
      const theme = createTheme();
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      expect(getByRole('pre')).toHaveAttribute('data-mui-color-scheme', 'dark');
    });

    it('renders styling info correctly when customized state is true', async () => {
      const theme = createTheme();
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      fireEvent.click(getByText('Custom Theme'));
      expect(getByText('Customized')).toBeInTheDocument();
    });
  });

  describe('FlashCode', () => {
    it('renders flashcode correctly when start and end lines are defined', async () => {
      const theme = createTheme();
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      const flashCodeElement = getByRole('flashcode');
      expect(flashCodeElement).toBeInTheDocument();
    });

    it('does not render flashcode when start and end lines are undefined', async () => {
      const theme = createTheme();
      const { queryByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      expect(queryByRole('flashcode')).not.toBeInTheDocument();
    });
  });

  describe('HighlightedCode', () => {
    it('renders highlighted lines correctly when start and end lines are defined', async () => {
      const theme = createTheme();
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      const highlightedCodeElement = getByRole('highlightedcode');
      expect(highlightedCodeElement).toBeInTheDocument();
    });

    it('does not render highlighted lines when start and end lines are undefined', async () => {
      const theme = createTheme();
      const { queryByRole } = render(
        <ThemeProvider theme={theme}>
          <CoreShowcase code />
        </ThemeProvider>
      );
      expect(queryByRole('highlightedcode')).not.toBeInTheDocument();
    });
  });
});