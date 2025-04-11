import { render, fireEvent, waitFor } from '@testing-library/react';
import '@stoked-ui/docs/branding';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextNProgressBar from 'src/modules/components/AppFrame';
import SkipLink from 'src/modules/components/SkipLink';
import MarkdownLinks from 'src/modules/components/MarkdownLinks';
import { getDesignTokens, getThemedComponents } from '@stoked-ui/docs/branding';
import CssVarsProvider from './BrandingCssVarsProvider';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    primaryDark?: PaletteColorOptions;
  }
}

const lightPalette = getDesignTokens('light').palette;
const darkPalette = getDesignTokens('dark').palette;

jest.mock('@stoked-ui/docs/branding', () => ({
  getDesignTokens: jest.fn(() => ({ palette: lightPalette, typography: {} })),
  getThemedComponents: jest.fn(() => []),
}));

describe('BrandingCssVarsProvider component', () => {
  it('renders without crashing', async () => {
    const { container } = render(
      <MuiThemeProvider theme={CssVarsProvider(theme)}>
        <CssBaseline />
        <SkipLink />
        <MarkdownLinks />
      </MuiThemeProvider>,
    );
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders children when not using system theme', async () => {
      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({})}>
          <SkipLink />
          <MarkdownLinks />
        </MuiThemeProvider>,
      );
      expect(container).not.toHaveClass('mui-system-theme');
    });

    it('renders children when using system theme', async () => {
      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({ defaultMode: 'system' })}>
          <SkipLink />
          <MarkdownLinks />
        </MuiThemeProvider>,
      );
      expect(container).toHaveClass('mui-system-theme');
    });

    it('renders children when disableTransitionOnChange', async () => {
      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({ defaultMode: 'system' })}>
          <SkipLink />
          <MarkdownLinks />
        </MuiThemeProvider>,
      );
      expect(container).not.toHaveClass('muidocs-transition-disabled');
    });

    it('renders children when disableTransitionOnChange', async () => {
      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({ defaultMode: 'system' })}>
          <SkipLink />
          <MarkdownLinks />
          <CssBaseline disabled transition={false} />
        </MuiThemeProvider>,
      );
      expect(container).toHaveClass('muidocs-transition-disabled');
    });
  });

  describe('props', () => {
    it('accepts children as a prop', async () => {
      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({})}>
          <SkipLink />
          <MarkdownLinks />
          <BrandingCssVarsProvider children={<div />}>
            <CssBaseline />
          </BrandingCssVarsProvider>
        </MuiThemeProvider>,
      );
      expect(container).toHaveTextContent('<div>');
    });

    it('rejects invalid props', async () => {
      const { error } = render(
        <MuiThemeProvider theme={CssVarsProvider({ invalidProp: 'value' })}>
          <SkipLink />
          <MarkdownLinks />
        </MuiThemeProvider>,
      );
      expect(error).not.toBeUndefined();
    });
  });

  describe('user interactions', () => {
    it('calls nextNProgressBar clicked prop on button click', async () => {
      const { getByRole, getByText } = render(
        <MuiThemeProvider theme={CssVarsProvider({})}>
          <SkipLink />
          <MarkdownLinks />
          <BrandingCssVarsProvider>
            <NextNProgressBar onClick={() => console.log('onClick')} />
            <CssBaseline />
          </BrandingCssVarsProvider>
        </MuiThemeProvider>,
      );

      const button = getByRole('button');
      fireEvent.click(button);

      expect(getByText('next n progress bar')).toHaveTextContent('on click');
    });

    it('calls skipLink clicked prop on button click', async () => {
      const { getByRole, getByText } = render(
        <MuiThemeProvider theme={CssVarsProvider({})}>
          <SkipLink />
          <MarkdownLinks />
          <BrandingCssVarsProvider>
            <SkipLink onClick={() => console.log('onClick')} />
            <CssBaseline />
          </BrandingCssVarsProvider>
        </MuiThemeProvider>,
      );

      const button = getByRole('button');
      fireEvent.click(button);

      expect(getByText('skip link')).toHaveTextContent('on click');
    });

    it('calls markdownLinks clicked prop on link click', async () => {
      const { getByRole, getByText } = render(
        <MuiThemeProvider theme={CssVarsProvider({})}>
          <SkipLink />
          <MarkdownLinks />
          <BrandingCssVarsProvider>
            <MarkdownLinks onClick={() => console.log('onClick')} />
            <CssBaseline />
          </BrandingCssVarsProvider>
        </MuiThemeProvider>,
      );

      const link = getByText('markdown links');
      fireEvent.click(link);

      expect(getByText('markdown links')).toHaveTextContent('on click');
    });
  });

  describe('side effects and state changes', () => {
    it('calls theme update function when defaultMode is updated', async () => {
      jest.spyOn(CssVarsProvider, 'updateTheme');

      const { container } = render(
        <MuiThemeProvider theme={CssVarsProvider({ defaultMode: 'system' })}>
          <SkipLink />
          <MarkdownLinks />
        </MuiThemeProvider>,
      );

      expect(CssVarsProvider.updateTheme).toHaveBeenCalledTimes(1);
    });
  });
});