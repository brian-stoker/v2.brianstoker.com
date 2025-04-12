import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeModeToggle as ThemeModeToggleComponent, ThemeContext } from './ThemeModeToggle.test.tsx';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useColorScheme: jest.fn(),
}));

jest.mock('src/modules/components/ThemeContext', () => ({
  useColorSchemeShim: jest.fn(() => ({ mode: 'dark', systemMode: 'system' })),
}));

describe('ThemeModeToggle component', () => {
  const onChangeMock = jest.fn();
  const themeVarsMock = { vars: {} };

  beforeEach(() => {
    // Set up the mock props
    ThemeContext.displayName = 'ThemeModeToggle';
    ThemeModeToggleComponent.mockProps = { onChange: onChangeMock };
    ThemeModeToggleComponent.mockProps.theme = themeVarsMock;
  });

  afterEach(() => {
    // Clean up any side effects
    onChangeMock.mockClear();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ThemeModeToggleComponent />);
    expect(getByText('Turn on the light')).toBeInTheDocument();
    expect(getByText('Turn off the light')).toBeInTheDocument();
  });

  describe('conditional rendering paths', () => {
    it('should render dark mode icon when system mode is enabled', async () => {
      const { getByText } = render(<ThemeModeToggleComponent />);
      expect(getByText('Turn on the light')).toBeInTheDocument();
      const lightIcon = getByRole('img', { name: 'light mode' });
      expect(lightIcon).toHaveAttribute('aria-label', 'Turn off the light');
    });

    it('should render dark mode icon when system mode is disabled', async () => {
      ThemeModeToggleComponent.mockProps.systemMode = false;
      const { getByText } = render(<ThemeModeToggleComponent />);
      expect(getByText('Turn on the light')).toBeInTheDocument();
      const darkIcon = getByRole('img', { name: 'dark mode' });
      expect(darkIcon).toHaveAttribute('aria-label', 'Turn off the light');
    });

    it('should not render icon when system mode is null', async () => {
      ThemeModeToggleComponent.mockProps.systemMode = null;
      const { getByText } = render(<ThemeModeToggleComponent />);
      expect(getByText('Turn on the light')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should throw an error when onChange prop is missing', async () => {
      ThemeModeToggleComponent.mockProps.onChange = undefined;
      const { container } = render(<ThemeModeToggleComponent />);
      expect(container).toHaveError('onChange is required');
    });
  });

  describe('user interactions', () => {
    it('should call onChange function on click', async () => {
      const mockOnClick = jest.fn();
      ThemeModeToggleComponent.mockProps.onChange = mockOnClick;
      const { getByText } = render(<ThemeModeToggleComponent />);
      fireEvent.click(getByText('Turn on the light'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onChange function on dark mode toggle', async () => {
      const mockOnClick = jest.fn();
      ThemeModeToggleComponent.mockProps.onChange = mockOnClick;
      const { getByText } = render(<ThemeModeToggleComponent />);
      fireEvent.click(getByText('Turn off the light'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  it('should not update theme when system mode is null', async () => {
    ThemeModeToggleComponent.mockProps.systemMode = null;
    const { getByText } = render(<ThemeModeToggleComponent />);
    fireEvent.click(getByText('Turn on the light'));
    await waitFor(() => expect(ThemeContext.useColorSchemeShim()).toEqual({ mode: 'dark', systemMode: 'system' }));
  });

  it('should update theme when onChange function is called with a new value', async () => {
    const mockOnChange = jest.fn();
    ThemeModeToggleComponent.mockProps.onChange = mockOnChange;
    const { getByText } = render(<ThemeModeToggleComponent />);
    fireEvent.click(getByText('Turn on the light'));
    await waitFor(() => expect(mockOnChange).toHaveBeenCalledTimes(1));
  });
});