import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import type { BrandingProviderProps } from './BrandingProvider';
import type { ThemeContextValue } from '@stoked-ui/docs/core';
import type { MockThemeContextProvider } from '../mocks/MockThemeContextProvider';

jest.mock('@stoked-ui/docs/core', () => ({
  ThemeContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

describe('BrandingProvider', () => {
  let themeContextMock: MockThemeContextProvider;
  const initialTheme: ThemeContextValue = {};

  beforeEach(() => {
    themeContextMock = new MockThemeContextProvider(initialTheme);
    jest.clearAllMocks();
  });

  afterEach(() => {
    themeContextMock.cleanup();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<BrandingProvider />);
      expect(container).not.toBeNull();
    });

    it('renders with theme context provider', async () => {
      const { container, getByText } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider />
        </MockThemeContextProvider>
      );
      expect(getByText('Stoked UI')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid props', async () => {
      const { container } = render(<BrandingProvider theme={initialTheme} />);
      expect(container).not.toBeNull();
    });

    it('rejects invalid props (missing theme)', async () => {
      expect(() => render(<BrandingProvider />)).toThrowError(
        'Required prop: `theme`'
      );
    });
  });

  describe('Conditional Rendering', () => {
    it('renders children when provided', async () => {
      const { container } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider>
            <div>Children rendered</div>
          </BrandingProvider>
        </MockThemeContextProvider>
      );
      expect(container).not.toBeNull();
    });

    it('does not render children when not provided', async () => {
      const { container } = render(<MockThemeContextProvider theme={initialTheme} />);
      expect(container).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('emits theme context change on click', async () => {
      const themeChangeSpy = jest.fn();
      const { container } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider theme={{}} onClick={themeChangeSpy} />
        </MockThemeContextProvider>
      );
      fireEvent.click(container.querySelector('.branding-provider__button'));
      expect(themeChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('emits theme context change on input', async () => {
      const themeChangeSpy = jest.fn();
      const { container } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider theme={{}} onChange={(theme) => themeChangeSpy(theme)} />
        </MockThemeContextProvider>
      );
      fireEvent.change(container.querySelector('input'), { target: { value: 'new theme' } });
      expect(themeChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('emits theme context change on form submission', async () => {
      const themeChangeSpy = jest.fn();
      const { container } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider theme={{}} onSubmit={(theme) => themeChangeSpy(theme)} />
        </MockThemeContextProvider>
      );
      fireEvent.change(container.querySelector('input'), { target: { value: 'new theme' } });
      fireEvent.submit(container.querySelector('form'));
      expect(themeChangeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects', () => {
    it('calls side effect on change', async () => {
      const sideEffect = jest.fn();
      render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider theme={{}} onChange={(theme) => sideEffect(theme)} />
        </MockThemeContextProvider>
      );
      fireEvent.change(document.querySelector('input'), { target: { value: 'new theme' } });
      await waitFor(() => expect(sideEffect).toHaveBeenCalledTimes(1));
    });

    it('calls side effect on submit', async () => {
      const sideEffect = jest.fn();
      render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider theme={{}} onSubmit={(theme) => sideEffect(theme)} />
        </MockThemeContextProvider>
      );
      fireEvent.change(document.querySelector('input'), { target: { value: 'new theme' } });
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(sideEffect).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshots', () => {
    it('renders correctly with theme context provider', async () => {
      const { container } = render(
        <MockThemeContextProvider theme={initialTheme}>
          <BrandingProvider />
        </MockThemeContextProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});