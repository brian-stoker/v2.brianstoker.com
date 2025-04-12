import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@mui/styles';
import UseTheme from './UseTheme';

describe('UseTheme', () => {
  const theme = {
    spacing: '8px',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<UseTheme />);
    expect(container).toBeInTheDocument();
  });

  it('renders DeepChild component with correct theme', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DeepChild />
      </ThemeProvider>
    );
    expect(getByText(`spacing ${theme.spacing}`)).toBeInTheDocument();
  });

  it('passes props to DeepChild component', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DeepChild spacing="10px" />
      </ThemeProvider>
    );
    expect(getByText(`spacing ${theme.spacing}`)).toHaveClass('spacing-10');
  });

  it('throws error when invalid prop is passed', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DeepChild invalidProp="test" />
      </ThemeProvider>
    );
    expect(getByText(`Invalid prop: 'invalidProp'`).toBeInTheDocument());
  });

  it('calls DeepChild with correct theme when clicked', () => {
    const mockTheme = jest.fn();
    useTheme.mockReturnValue(mockTheme);
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <DeepChild />
      </ThemeProvider>
    );
    expect(mockTheme).toHaveBeenCalledTimes(1);
  });

  it('updates theme when theme prop is changed', () => {
    const initialTheme = theme;
    const newTheme = { spacing: '12px' };
    const { getByText } = render(
      <ThemeProvider theme={initialTheme}>
        <UseTheme />
      </ThemeProvider>
    );
    fireEvent.change(reactRef.current, { target: { theme: newTheme } });
    expect(getByText(`spacing ${newTheme.spacing}`)).toBeInTheDocument();
  });

  it('renders without crashing when props are invalid', () => {
    const invalidProps = { spacing: 'invalid' };
    const { container } = render(<UseTheme {...invalidProps} />);
    expect(container).toBeInTheDocument();
  });
});