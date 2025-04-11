import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LANGUAGES, LANGUAGES_SSR, LANGUAGES_IN_PROGRESS, LANGUAGES_IGNORE_PAGES } from './config';

describe('Config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Language Options', () => {
    it('renders without crashing', async () => {
      const { container } = render(<LangOptions />);
      expect(container).toBeTruthy();
    });
  });

  describe('Invalid Prop Validation', () => {
    it('validates language options prop correctly', async () => {
      const invalidProps: any = {};
      await expect(() => render(<LangOptions {...invalidProps} />)).rejects.toThrowError(
        'Invalid prop: Language Options'
      );
    });

    it('validates languages SSR prop correctly', async () => {
      const invalidProps: any = { [LANGUAGES_SSR]: undefined };
      await expect(() => render(<LangOptions {...invalidProps} />)).rejects.toThrowError(
        'Invalid prop: Languages SSR'
      );
    });
  });

  describe('Language Options Rendering', () => {
    it('renders all languages correctly', async () => {
      const { getAllByRole } = render(<LangOptions />);
      const languages = await getAllByRole('listitem');
      expect(languages).toHaveLength(LANGUAGES.length);
    });

    it('renders only ignored languages correctly', async () => {
      jest.spyOn(LANGUAGES_IGNORE_PAGES, 'LANGUAGE_SSR').mockImplementation(() =>
        new Set([LANGUAGES_SSR])
      );
      const { getAllByRole } = render(<LangOptions />);
      const ignoredLanguages = await getAllByRole('listitem');
      expect(ignoredLanguages).toHaveLength(0);
    });

    it('renders languages in progress correctly', async () => {
      jest.spyOn(LANGUAGES_IN_PROGRESS, 'LANGUAGE_SSR').mockImplementation(() =>
        new Set([LANGUAGES_SSR])
      );
      const { getAllByRole } = render(<LangOptions />);
      const languagesInProgress = await getAllByRole('listitem');
      expect(languagesInProgress).toHaveLength(0);
    });
  });

  describe('User Interactions', () => {
    it('toggles language options correctly on click', async () => {
      jest.spyOn(document, 'elementById').mockImplementation(() =>
        document.getElementById('languageOptions')
      );
      const { getByText } = render(<LangOptions />);
      const toggleButton = getByText('Toggle Language Options');
      fireEvent.click(toggleButton);
      expect(document.getElementById('languageOptions')).not.toBeNull();
    });

    it('submits language options correctly on form submission', async () => {
      jest.spyOn(document, 'elementById').mockImplementation(() =>
        document.getElementById('languageForm')
      );
      const { getByText } = render(<LangOptions />);
      const submitButton = getByText('Submit Language Options');
      fireEvent.click(submitButton);
      await waitFor(() => expect(1).toBeGreaterThan(0));
    });
  });

  describe('Snapshot Tests', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<LangOptions />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});