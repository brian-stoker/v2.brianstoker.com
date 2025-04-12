import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeProvider, withTheme } from '@mui/styles';
import PropTypes from 'prop-types';

// Mock theme
const mockTheme = {
  spacing: '8px',
};

describe('WithTheme', () => {
  beforeEach(() => {
    // Clear any existing mocks or spies before each test
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // Clean up any mocks or spy setup after each test
    jest.clearAllMocks();
  });

  describe('Rendering with theme props', () => {
    it('renders DeepChild component without crashing', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild />
        </ThemeProvider>
      );
      expect(container).not.toBeNull();
    });

    it('renders DeepChild component with valid spacing prop', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild theme={{ spacing: '8px' }} />
        </ThemeProvider>
      );
      expect(screen.getByText('spacing 8px')).toBeInTheDocument();
    });

    it('renders DeepChild component with invalid spacing prop', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild theme={{ spacing: null }} />
        </ThemeProvider>
      );
      expect(container).not.toBeNull(); // Note: this test may not fail as expected due to React's tolerance for errors
    });
  });

  describe('Conditional rendering', () => {
    it('renders no children if DeepChild prop is falsy', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild />
        </ThemeProvider>
      );
      expect(container).not.toHaveClass('MuiBox-root');
    });

    it('renders children if DeepChild prop is truthy', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild>Children</DeepChild>
        </ThemeProvider>
      );
      expect(container).toHaveClass('MuiBox-root');
    });
  });

  describe('Props validation', () => {
    it('accepts valid spacing prop', async () => {
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild theme={{ spacing: '8px' }} />
        </ThemeProvider>
      );
      expect(container).not.toBeNull();
    });

    it('rejects invalid spacing prop (string)', async () => {
      const { error } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild theme={{ spacing: null }} />
        </ThemeProvider>,
        { throwOnError: true }
      );
      expect(error).toBeInstanceOf(Error);
    });

    it('rejects invalid spacing prop (number)', async () => {
      const { error } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild theme={{ spacing: 8 }} />
        </ThemeProvider>,
        { throwOnError: true }
      );
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('User interactions', () => {
    it('calls DeepChild onClick prop when clicked', async () => {
      const mockClick = jest.fn();
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild onClick={mockClick} />
        </ThemeProvider>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('calls DeepChild onChange prop when input changes', async () => {
      const mockChange = jest.fn();
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild onChange={mockChange} />
        </ThemeProvider>
      );
      fireEvent.change(screen.getByRole('textbox'), { target: 'new value' });
      expect(mockChange).toHaveBeenCalledTimes(1);
    });

    it('calls DeepChild onSubmit prop when form submitted', async () => {
      const mockSubmit = jest.fn();
      const { container } = render(
        <ThemeProvider theme={mockTheme}>
          <form>
            <DeepChild onSubmit={mockSubmit} />
            <button type="submit">Submit</button>
          </form>
        </ThemeProvider>
      );
      fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('renders with expected HTML structure', async () => {
      const { asFragment } = render(
        <ThemeProvider theme={mockTheme}>
          <DeepChild />
        </ThemeProvider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

// Mock theme for snapshot test
const mockThemeForSnapshot = {
  spacing: '8px',
};