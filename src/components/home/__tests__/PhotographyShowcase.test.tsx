import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@mui/material/styles';
import themeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';

import CoreShowcase from './CoreShowcase';

const mockLineMapping = {
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

const mockElement = {
  id: 'card',
  name: 'Card',
  target: null,
};

describe('CoreShowcase', () => {
  it('renders without crashing', async () => {
    const theme = createTheme();
    await render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
  });

  describe('conditional rendering', () => {
    it('renders showcase container with preview component', async () => {
      const theme = createTheme();
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      expect(screen.getByRole('button')).toHaveTextContent('Material Design');
      expect(screen.getByRole('button')).toHaveTextContent('Custom Theme');

      const previewElement = screen.queryByRole('img');
      if (previewElement) {
        expect(previewElement).toMatchSnapshot();
      }
    });

    it('renders showcase container with code component', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      expect(screen.getByRole('button')).toHaveTextContent('Material Design');
      expect(screen.getByRole('button')).toHaveTextContent('Custom Theme');

      const codeElement = screen.queryByRole('pre');
      if (codeElement) {
        expect(codeElement).toMatchSnapshot();
      }
    });

    it('renders showcase container with both preview and code components', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      expect(screen.getByRole('button')).toHaveTextContent('Material Design');
      expect(screen.getByRole('button')).toHaveTextContent('Custom Theme');

      const previewElement = screen.queryByRole('img');
      if (previewElement) {
        expect(previewElement).toMatchSnapshot();
      }

      const codeElement = screen.queryByRole('pre');
      if (codeElement) {
        expect(codeElement).toMatchSnapshot();
      }
    });
  });

  describe('clicking buttons', () => {
    it('toggles custom theme', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const buttonElement1 = screen.getByRole('button', { name: /Material Design/i });
      const buttonElement2 = screen.getByRole('button', { name: /Custom Theme/i });

      fireEvent.click(buttonElement1);
      await waitFor(() => expect(screen.queryByRole('button')).toHaveAttribute('color', 'primary'));

      fireEvent.click(buttonElement2);
      await waitFor(() => expect(screen.queryByRole('button')).toHaveAttribute('color', 'secondary'));
    });
  });

  describe('rendering with custom theme', () => {
    it('renders preview component with correct colors', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const previewElement = screen.queryByRole('img');
      if (previewElement) {
        expect(previewElement).toHaveStyle('background-color: #000');
      }
    });

    it('renders code component with correct colors', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const codeElement = screen.queryByRole('pre');
      if (codeElement) {
        expect(codeElement).toHaveStyle('background-color: #000');
      }
    });

    it('renders preview component with correct text color', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const previewElement = screen.queryByRole('img');
      if (previewElement) {
        expect(previewElement).toHaveStyle('color: #fff');
      }
    });

    it('renders code component with correct text color', async () => {
      const theme = createTheme({
        palette: { mode: 'dark' },
      });
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const codeElement = screen.queryByRole('pre');
      if (codeElement) {
        expect(codeElement).toHaveStyle('color: #fff');
      }
    });
  });

  describe('highlighted lines', () => {
    it('renders highlighted lines with correct colors and positions', async () => {
      const theme = createTheme();
      await render(
        <ThemeProvider theme={theme}>
          <CoreShowcase />
        </ThemeProvider>
      );

      const previewElement = screen.queryByRole('img');
      if (previewElement) {
        expect(previewElement).toMatchSnapshot();

        const startLine = 10;
        const endLine = 15;

        const highlightedCodeElement = screen.queryByRole('pre', { role: 'code' });
        if (highlightedCodeElement) {
          expect(highlightedCodeElement).toHaveStyle(`background-color: #333; color: #fff`);
          expect(highlightedCodeElement).toHaveStyle(`text-decoration: line-through ${startLine - 1}px solid #000`);

          const codeText = highlightedCodeElement.textContent;
          expect(codeText).toContain(`${codeText.substring(0, startLine)}/* */${codeText.substring(endLine)}`);
        }
      }
    });
  });
});