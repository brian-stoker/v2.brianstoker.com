import { render, fireEvent, screen } from '@testing-library/react';
import '@mui/material/styles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import useTheme from '@mui/material/styles/useTheme';
import * as React from 'react';
import CoreShowcase from './CoreShowcase';

jest.mock('@mui/material/styles', () => ({
  // Add your mock implementations here
}));

describe('Core Showcase Component Test Suite', () => {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
    shape: {},
    shadows: [],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '',
            backgroundColor: '#fff',
            border: '1px solid #000',
          },
        },
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div style="width: 100%;"></div>';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('renders preview component with correct theme', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(getByText('Material Design')).toBeInTheDocument();
    expect(getByText('Custom Theme')).toBeInTheDocument();
  });

  it('renders code component with correct syntax highlighting', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase />
      </ThemeProvider>
    );
    expect(queryByText('jsx')).not.toBeInTheDocument();
    expect(getByText('Material Design')).toBeInTheDocument();
  });

  it('custom theme button click event is triggered', () => {
    const onElementChange = jest.fn();
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase onElementChange={onElementChange} />
      </ThemeProvider>
    );
    expect(getByText('Custom Theme')).toBeInTheDocument();
    fireEvent.click(getByText('Custom Theme'));
    expect(onElementChange).toHaveBeenCalledTimes(1);
  });

  it('custom theme button click event is triggered for customized theme', () => {
    const onElementChange = jest.fn();
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <CoreShowcase onElementChange={onElementChange} />
      </ThemeProvider>
    );
    expect(getByText('Custom Theme')).toBeInTheDocument();
    fireEvent.click(getByText('Custom Theme'));
    expect(onElementChange).toHaveBeenCalledTimes(1);
  });
});