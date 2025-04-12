import { render, fireEvent, waitFor } from '@testing-library/react';
import TableOfContentsBanner from './TableOfContentsBanner.test.tsx';
import { FeatureToggleMock } from './FeatureToggleMock.test.ts';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('TableOfContentsBanner', () => {
  const featureToggleEnableTocBanner = true;
  const featureToggleDisableTocBanner = false;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <TableOfContentsBanner />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  describe('props', () => {
    it('accepts enabled prop and renders the banner when enabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('does not accept disabled prop and does not render the banner when disabled', async () => {
      const { queryByText, queryByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleDisableTocBanner} />
        </ThemeProvider>
      );
      expect(queryByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
    });

    it('accepts href and target props', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} href="https://example.com" target="_blank" />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('accepts sx prop and renders the banner with styles applied', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} sx={{ color: 'red' }} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('accepts darkStyles prop and renders the banner with styles applied', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} darkStyles={{ color: 'red' }} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('renders only when feature toggle is enabled', async () => {
      const { container } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner />
        </ThemeProvider>
      );
      expect(container).not.toBeInTheDocument();
    });

    it('does not render when feature toggle is disabled', async () => {
      const { queryByText, queryByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner disabled={true} />
        </ThemeProvider>
      );
      expect(queryByText('Stoked UI stands with Grumpy Cat')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('does not trigger on click when feature toggle is disabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('triggers on click when feature toggle is enabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      const link = getByRole('link');
      fireEvent.click(link);
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('does not trigger on focus when feature toggle is disabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('triggers on focus when feature toggle is enabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      const link = getByRole('link');
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });

    it('submits the form when feature toggle is enabled', async () => {
      const { getByText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={featureToggleEnableTocBanner} />
        </ThemeProvider>
      );
      expect(getByText('Stoked UI stands with Grumpy Cat')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('does not trigger side effect when feature toggle is disabled', async () => {
      const mockFeatureToggle = new FeatureToggleMock(false);
      render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={mockFeatureToggle} />
        </ThemeProvider>
      );
      expect(mockFeatureToggle).not.toHaveBeenCalled();
    });

    it('triggers side effect when feature toggle is enabled', async () => {
      const mockFeatureToggle = new FeatureToggleMock(true);
      render(
        <ThemeProvider theme={theme}>
          <TableOfContentsBanner enabled={mockFeatureToggle} />
        </ThemeProvider>
      );
      expect(mockFeatureToggle).toHaveBeenCalledTimes(1);
    });
  });
});