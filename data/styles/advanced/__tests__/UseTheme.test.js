import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@mui/styles';
import UseTheme from './UseTheme';

jest.mock('@mui/styles', () => ({
  ...jest.requireActual('@mui/styles'),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

describe('UseTheme component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing with default props', async () => {
    const { getByText } = render(<UseTheme />);
    expect(getByText('spacing 8px')).toBeInTheDocument();
  });

  it('renders DeepChild with correct theme value when spacing prop is defined', async () => {
    const { getByText } = render(
      <ThemeProvider theme={{ spacing: '16px' }}>
        <UseTheme />
      </ThemeProvider>
    );
    expect(getByText(`spacing ${16}`)).toBeInTheDocument();
  });

  it('renders DeepChild with default theme value when spacing prop is not defined', async () => {
    const { getByText } = render(<UseTheme />);
    expect(getByText(`spacing 8px`)).toBeInTheDocument();
  });

  it('throws error when spacing prop is undefined', async () => {
    const getDebugValueMock = jest.fn(() => ({ spacing: 'undefined' }));
    useTheme.mockReturnValue(getDebugValueMock);
    expect(() => render(<UseTheme />)).toThrowError(
      'Cannot read property "spacing" of undefined'
    );
  });

  it('calls callback when spacing prop is changed', async () => {
    const callback = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={{ spacing: '16px' }}>
        <UseTheme onChange={callback} />
      </ThemeProvider>
    );
    fireEvent.change(getByText('spacing'), { target: { value: '32px' } });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback with updated spacing value', async () => {
    const callback = jest.fn();
    const { getByText } = render(
      <ThemeProvider theme={{ spacing: '16px' }}>
        <UseTheme onChange={callback} />
      </ThemeProvider>
    );
    fireEvent.change(getByText('spacing'), { target: { value: '32px' } });
    expect(callback).toHaveBeenCalledWith(32);
  });

  it('renders with correct theme when useTheme hook is used', async () => {
    const { getByText } = render(
      <ThemeProvider theme={{ spacing: '16px' }}>
        <UseTheme />
      </ThemeProvider>
    );
    const themeValue = useTheme().spacing;
    expect(getByText(`spacing ${themeValue}`)).toBeInTheDocument();
  });
});