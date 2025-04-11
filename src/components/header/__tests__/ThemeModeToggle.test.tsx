import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CssVarsModeToggle from './CssVarsModeToggle';

describe('CssVarsModeToggle', () => {
  const mockSetMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<CssVarsModeToggle onChange={mockSetMode} />);
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('renders light mode by default when system mode is enabled', async () => {
    const mockSystemMode = 'system';
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: mockSystemMode,
      systemMode: mockSystemMode,
      setMode: mockSetMode,
    }));

    render(<CssVarsModeToggle onChange={mockSetMode} />);
    await waitFor(() => expect(mockSetMode).toHaveBeenCalledTimes(1));
  });

  it('renders dark mode by default when system mode is disabled', async () => {
    const mockSystemMode = 'system';
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: mockSystemMode,
      systemMode: 'disabled',
      setMode: mockSetMode,
    }));

    render(<CssVarsModeToggle onChange={mockSetMode} />);
    await waitFor(() => expect(mockSetMode).toHaveBeenCalledTimes(1));
  });

  it('renders light mode when clicking on light button', async () => {
    const mockSystemMode = 'system';
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: mockSystemMode,
      systemMode: mockSystemMode,
      setMode: mockSetMode,
    }));

    render(<CssVarsModeToggle onChange={mockSetMode} />);
    const lightButton = await waitFor(() => expect(document.querySelector('[data-testid="light-button"]')).toBeInTheDocument());
    fireEvent.click(lightButton);
    await waitFor(() => expect(mockSetMode).toHaveBeenCalledTimes(1));
  });

  it('renders dark mode when clicking on dark button', async () => {
    const mockSystemMode = 'system';
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: mockSystemMode,
      systemMode: mockSystemMode,
      setMode: mockSetMode,
    }));

    render(<CssVarsModeToggle onChange={mockSetMode} />);
    const darkButton = await waitFor(() => expect(document.querySelector('[data-testid="dark-button"]')).toBeInTheDocument());
    fireEvent.click(darkButton);
    await waitFor(() => expect(mockSetMode).toHaveBeenCalledTimes(1));
  });

  it('renders tooltip with correct title', async () => {
    render(<CssVarsModeToggle onChange={mockSetMode} />);
    const tooltip = await waitFor(() => expect(document.querySelector('[data-testid="tooltip"]')).toBeInTheDocument());
    expect(tooltip.textContent).toBe('Turn off the light');
  });

  it('throws an error when mode prop is not a string', () => {
    const invalidMode = null;
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: invalidMode,
      systemMode: null,
      setMode: mockSetMode,
    }));

    expect(() => render(<CssVarsModeToggle onChange={mockSetMode} mode="invalid" />)).toThrowError();
  });

  it('renders children when props are provided', async () => {
    const children = <div>Rendered children</div>;
    jest.spyOn(CssVarsModeToggle, 'useColorSchemeShim').mockImplementation(() => ({
      mode: null,
      systemMode: null,
      setMode: mockSetMode,
    }));

    render(<CssVarsModeToggle onChange={mockSetMode}>{children}</CssVarsModeToggle>);
    expect(document.querySelector('[data-testid="tooltip"]')).not.toBeInTheDocument();
  });
});