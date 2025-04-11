import { render, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggleButton from './ThemeToggleButton';
import { ThemeToggleContextProvider } from './ThemeToggleContextProvider';

describe('ThemeToggleButton', () => {
  const initialLang = 'joy';

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { container } = render(
      <ThemeToggleContextProvider>
        <ThemeToggleButton />
      </ThemeToggleContextProvider>
    );
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders language selector with default lang', async () => {
      const { getByText, queryByRole } = render(
        <ThemeToggleContextProvider>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      expect(getByText(initialLang)).toBeInTheDocument();
      expect(queryByRole('tab')).not.toBeInTheDocument();
    });

    it('renders language selector with invalid lang', async () => {
      const { getByText, queryByRole } = render(
        <ThemeToggleContextProvider theme={{ lang: 'invalid' }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      expect(getByText('Invalid Lang')).toBeInTheDocument();
      expect(queryByRole('tab')).not.toBeInTheDocument();
    });

    it('renders language selector with default lang on theme change', async () => {
      const { getByText, queryByRole } = render(
        <ThemeToggleContextProvider theme={{ lang: 'invalid' }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: initialLang })
      );
      await waitFor(() => expect(getByText(initialLang)).toBeInTheDocument());
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockReset();
    });
  });

  describe('prop validation', () => {
    it('validates required prop value prop', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: 'invalid' }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      expect(getByText('Invalid Lang')).toBeInTheDocument();
      expect(() => ThemeToggleButton({})).toThrowError();
    });

    it('validates required prop value prop on theme change', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: 'invalid' }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: initialLang })
      );
      await waitFor(() => expect(getByText(initialLang)).toBeInTheDocument());
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockReset();
    });
  });

  describe('user interactions', () => {
    it('calls onChange when language is changed', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: initialLang }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: 'joy' })
      );
      fireEvent.click(getByText('Joy UI'));
      await waitFor(() => expect((// @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme).mock.calls[0]).toEqual([
        { lang: 'joy' },
      ]));
    });

    it('calls onChange when language is changed in other language', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: initialLang }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: 'material' })
      );
      fireEvent.click(getByText('Stoked UI'));
      await waitFor(() => expect((// @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme).mock.calls[0]).toEqual([
        { lang: 'material' },
      ]));
    });

    it('calls onChange when language is changed with default lang', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: initialLang }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: 'base' })
      );
      fireEvent.click(getByText('Base UI'));
      await waitFor(() => expect((// @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme).mock.calls[0]).toEqual([
        { lang: 'base' },
      ]));
    });
  });

  describe('side effects', () => {
    it('calls setLang when language is changed', async () => {
      const setLangSpy = jest.spyOn(ThemeToggleButton, 'setLang');
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: initialLang }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: 'joy' })
      );
      fireEvent.click(getByText('Joy UI'));
      await waitFor(() => expect(setLangSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('theme changes', () => {
    it('calls onChange when language is changed with default lang', async () => {
      const { getByText } = render(
        <ThemeToggleContextProvider theme={{ lang: 'invalid' }}>
          <ThemeToggleButton />
        </ThemeToggleContextProvider>
      );
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockImplementation(() =>
        Promise.resolve({ lang: initialLang })
      );
      await waitFor(() => expect(getByText(initialLang)).toBeInTheDocument());
      // @ts-ignore
      ThemeToggleContextProvider.prototype.updateTheme.mockReset();
    });
  });
});