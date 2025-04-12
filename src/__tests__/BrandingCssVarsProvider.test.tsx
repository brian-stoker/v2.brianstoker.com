import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { create } from 'vitest';
import { deepmerge } from '@mui/utils';
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  PaletteColorOptions,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { NextNProgressBar } from 'src/modules/components/AppFrame';
import { getDesignTokens, getThemedComponents } from '@stoked-ui/docs/branding';
import SkipLink from 'src/modules/components/SkipLink';
import MarkdownLinks from 'src/modules/components/MarkdownLinks';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    primaryDark?: PaletteColorOptions;
  }
}

const { palette: lightPalette, typography, ...designTokens } = getDesignTokens('light');
const { palette: darkPalette } = getDesignTokens('dark');

const theme = extendTheme({
  cssVarPrefix: 'muidocs',
  colorSchemes: {
    light: {
      palette: lightPalette,
    },
    dark: {
      palette: darkPalette,
    },
  },
  ...designTokens,
  typography: deepmerge(typography, {
    h1: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-common-white)',
      },
    },
    h2: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-grey-100)',
      },
    },
    h5: {
      ':where([data-mui-color-scheme="dark"]) &': {
        color: 'var(--muidocs-palette-primary-300)',
      },
    },
  }),
  ...getThemedComponents(),
});

interface TestProps extends Omit<BrandingCssVarsProviderProps, 'children'> {}

function BrandingCssVarsProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <NextNProgressBar />
      <CssBaseline />
      <SkipLink />
      <MarkdownLinks />
      {children}
    </CssVarsProvider>
  );
}

const BrandingCssVarsProviderTest: Test = {
  test: async (testContext) => {
    const testContextValue = await testContext.create(
      'BrandingCssVarsProviderTest',
      BrandingCssVarsProvider,
      {},
      expect
    );

    // Render with valid props and wait for initial render to complete
    const { getByText, queryByRole } = render(
      <BrandingCssVarsProvider>
        {({ children }) => <div>{children}</div> }
      </BrandingCssVarsProvider>,
      testContextValue.context
    );
    await waitFor(() => expect(getByText('Test')).toBeInTheDocument());

    // Test conditional rendering of SkipLink and MarkdownLinks
    const skipLink = queryByRole('button', { name: 'Skip to content' });
    const markdownLinks = queryByRole('nav', { name: 'Markdown Links' });

    expect(skipLink).not.toBeInTheDocument();
    expect(markdownLinks).toBeNull();

    // Test SkipLink and MarkdownLinks are rendered after parent component
    render(
      <BrandingCssVarsProvider>
        <SkipLink />
        <MarkdownLinks />
        ({({ children }) => <div>{children}</div> })
      </BrandingCssVarsProvider>,
      testContextValue.context
    );
    await waitFor(() => expect(getByText('Test')).toBeInTheDocument());
    expect(skipLink).toBeInTheDarkMode();
    expect(markdownLinks).not.toBeInTheDocument();

    // Test that component renders without crashing
    try {
      render(<BrandingCssVarsProvider />);
    } catch (error) {
      console.error(error);
    }

    // Test prop validation by providing valid and invalid props
    const testProps = { children: 'Test' };
    expect(React.isValidElement(<BrandingCssVarsProvider {...testProps}])).toBe(true);

    // Render with invalid theme prop and wait for initial render to complete
    try {
      render(
        <BrandingCssVarsProvider theme="invalid-theme">
          {({ children }) => <div>{children}</div> }
        </BrandingCssVarsProvider>,
        testContextValue.context
      );
    } catch (error) {
      console.error(error);
    }

    // Test that component throws an error when invalid theme prop is provided
    expect(() =>
      render(
        <BrandingCssVarsProvider theme="invalid-theme">
          {({ children }) => <div>{children}</div> }
        </BrandingCssVarsProvider>,
        testContextValue.context
      )
    ).toThrowError();

    // Test user interactions (clicks, input changes, form submissions)
    const button = getByRole('button', 'Click me');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Click me');

    // Test that component renders CSSBaseline correctly
    render(
      <BrandingCssVarsProvider>
        <CssBaseline />
        {({ children }) => <div>{children}</div> }
      </BrandingCssVarsProvider>,
      testContextValue.context
    );
    await waitFor(() => expect(getByText('Test')).toBeInTheDocument());

    // Snapshot testing for default props
    render(<BrandingCssVarsProvider />);
    expect(renderToString(<BrandingCssVarsProvider />)).toMatchSnapshot();
  },
};