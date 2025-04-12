import React from '@testing-library/react';
import { render, fireEvent, waitFor } from '@testing-library/react-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import HighlightedCode from 'src/modules/components/HighlightedCode';
import MarkdownElement from 'src/components/markdown/MarkdownElement';
import MaterialDesignDemo, { componentCode } from 'src/components/home/MaterialDesignDemo';
import ShowcaseContainer from 'src/components/home/ShowcaseContainer';
import PointerContainer, { Data } from 'src/components/home/ElementPointer';
import StylingInfo from 'src/components/action/StylingInfo';
import FlashCode from 'src/components/animation/FlashCode';
import Frame from "../action/Frame";
import NoSsr from "@mui/material/NoSsr";
import Fade from "@mui/material/Fade";

interface Data {
  id: string | number;
  name?: string;
  target?: React.ReactNode;
}

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

describe('ArtShowcase component', () => {
  beforeEach(() => {
    // Reset the global theme before each test
    const globalTheme = createTheme();
    jest.mock('@mui/material/styles', () => ({
      ...jest.requireActual('@mui/material/styles'),
      defaultTheme: globalTheme,
    }));
  });

  afterEach(() => {
    // Clean up mock after each test
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<ArtShowcase />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders demo content', async () => {
      const { getByText } = render(
        <ThemeProvider theme={createTheme()}>
          <ArtShowcase />
        </ThemeProvider>
      );
      await waitFor(() => expect(getByText('Demo')).toBeInTheDocument());
    });

    it('does not render demo content on NoSsr component', async () => {
      const { container } = render(
        <NoSsr>
          <ArtShowcase />
        </NoSsr>
      );
      expect(container).not.toContainElement(getByText('Demo'));
    });
  });

  describe('props validation', () => {
    it('allows valid props to pass', async () => {
      const { getByText } = render(
        <ThemeProvider theme={createTheme()}>
          <ArtShowcase />
        </ThemeProvider>
      );
      expect(getByText('Demo')).toBeInTheDocument();
    });

    it('throws an error on invalid props', async () => {
      const spyError = jest.fn();
      const test = render(<ArtShowcase />);

      // Trigger an error
      test.getByText('Test Error').then(() => spyError());

      expect(spyError).toHaveBeenCalledTimes(1);
    });
  });

  describe('events', () => {
    it('calls the onClick event handler on button click', async () => {
      const handleClick = jest.fn();
      const { getByText, getByRole } = render(
        <ThemeProvider theme={createTheme()}>
          <ArtShowcase onClick={handleClick} />
        </ThemeProvider>
      );

      // Trigger a click
      fireEvent.click(getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls the onHighlightLines event handler on highlighted lines change', async () => {
      const onHighlightLines = jest.fn();
      const { getByText } = render(
        <ThemeProvider theme={createTheme()}>
          <ArtShowcase onHighlightLines={onHighlightLines} />
        </ThemeProvider>
      );

      // Trigger a change
      fireEvent.change(getByText('Test'), { target: 'new value' });

      expect(onHighlightLines).toHaveBeenCalledTimes(1);
    });
  });
});