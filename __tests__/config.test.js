import { render, fireEvent, waitFor } from '@testing-library/react';
import LangConfig from './LangConfig';

describe('LangConfig', () => {
  const pathname = '/example-pathname';
  const invalidpathname = '/invalid-pathname';
  const languages = ['en'];
  const languagesInProgress = [...languages];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.window === null;
  });

  describe('renders', () => {
    it('should render without crashing', async () => {
      expect.assertions(1);
      await waitFor(() => expect(render(<LangConfig />, { container: document.body })).byVisible().exists());
    });
  });

  describe('conditional rendering', () => {
    it('should ignore blog pages', async () => {
      const { container } = render(<LangConfig pathname={pathname} />);
      expect(LANGUAGES_IGNORE_PAGES(pathname)).toBe(true);
    });

    it('should not ignore size snapshot page', async () => {
      const { container } = render(<LangConfig pathname={invalidpathname} />);
      expect(LANGUAGES_IGNORE_PAGES(invalidpathname)).toBe(false);
    });
  });

  describe('languages prop validation', () => {
    it('should validate languages prop as an array', () => {
      expect.assertions(1);
      const langConfig = { LANGUAGES: ['en', 'fr'] };
      render(<LangConfig {...langConfig} />);
      expect(langConfig.LANGUAGES).toBeInstanceOf(Array);
    });

    it('should reject invalid languages prop as an array', () => {
      expect.assertions(2);
      const invalidLangConfig = { LANGUAGES: 'invalid' };
      try {
        render(<LangConfig {...invalidLangConfig} />);
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe('Invalid prop `LANGUAGES` of type `string` supplied to `LangConfig`, expected `array`');
      }
    });

    it('should validate languagesInProgress prop as an array', () => {
      expect.assertions(1);
      const langConfig = { LANGUAGES_IN_PROGRESS: ['en'] };
      render(<LangConfig {...langConfig} />);
      expect(langConfig.LANGUAGES_IN_PROGRESS).toBeInstanceOf(Array);
    });

    it('should reject invalid languagesInProgress prop as an array', () => {
      expect.assertions(2);
      const invalidLangConfig = { LANGUAGES_IN_PROGRESS: 'invalid' };
      try {
        render(<LangConfig {...invalidLangConfig} />);
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toBe('Invalid prop `LANGUAGES_IN_PROGRESS` of type `string` supplied to `LangConfig`, expected `array`');
      }
    });
  });

  describe('user interactions', () => {
    it('should handle language change on click', async () => {
      const { getByText, getByRole } = render(<LangConfig pathname={pathname} />);
      const languageOption = getByRole('option', { name: 'en' });
      fireEvent.click(languageOption);
      expect(getByText('English')).toBeInTheDocument();
    });

    it('should handle input change on language selection', async () => {
      const { getByText, getByRole } = render(<LangConfig pathname={pathname} />);
      const languageInput = getByRole('textbox');
      fireEvent.change(languageInput, { target: { value: 'fr' } });
      expect(getByText('French')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const { getByText, getByRole } = render(<LangConfig pathname={pathname} />);
      const languageForm = getByRole('form');
      fireEvent.change(languageForm, { target: { value: 'es' } });
      fireEvent.submit(languageForm);
      expect(getByText('Spanish')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('should update languagesInProgress prop when new languages are added', async () => {
      const langConfig = { LANGUAGES_IN_PROGRESS: ['en'] };
      render(<LangConfig {...langConfig} />);
      expect(langConfig.LANGUAGES_IN_PROGRESS).toBeInstanceOf(Array);
      expect(langConfig.LANGUAGES_IN_PROGRESS.length).toBe(1);

      langConfig.LANGUAGES_IN_PROGRESS.push('fr');
      render(<LangConfig {...langConfig} />);
      await waitFor(() => expect(langConfig.LANGUAGES_IN_PROGRESS).not.toBeInstanceOf(Array));
    });
  });

  describe('snapshots', () => {
    it('should render with expected HTML structure', () => {
      const { container } = render(<LangConfig pathname={pathname} />);
      expect(container).toMatchSnapshot();
    });
  });
});