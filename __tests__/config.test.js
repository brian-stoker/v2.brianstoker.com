import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import LangConfig from './LangConfig';

describe('LangConfig', () => {
  const mockedLangs = [
    {
      lang: 'en',
      fallback: false,
    },
    {
      lang: 'es',
      fallback: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<LangConfig />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering', () => {
    it('renders ignored pages correctly', async () => {
      const { getByText } = render(<LangConfig lang="en" ignorePages={['/blog']} />);
      expect(getByText('/blog')).toBeNull();
    });

    it('renders size snapshot page correctly', async () => {
      const { getByText } = render(<LangConfig lang="en" ignorePages={['/size-snapshot/']} />);
      expect(getByText('Size Snapshot')).not.toBeNull();
    });
  });

  describe('prop validation', () => {
    it('accepts valid languages', async () => {
      const { container } = render(<LangConfig langs={mockedLangs} />);
      expect(container).not.toBeNull();
    });

    it('rejects invalid languages', async () => {
      const langInvalid = 'invalid-language';
      const { container } = render(<LangConfig langs={[langInvalid]} />);
      expect(container).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('renders language dropdown correctly', async () => {
      const { getByRole, getAllByRole } = render(<LangConfig lang="en" />);
      const languages = await getAllByRole('option');
      expect(languages.length).toBe(1);
    });

    it('changes language when selected', async () => {
      const { getByRole, fireEvent } = render(<LangConfig lang="en" />);
      const languageOption = getByRole('option', { name: 'English' });
      fireEvent.click(languageOption);
      expect(getByRole('option', { name: 'Spanish' })).toBeSelected();
    });

    it('submits form on language change', async () => {
      const { getByText, fireEvent } = render(<LangConfig lang="en" />);
      const languageForm = getByText('Language');
      fireEvent.change(languageForm, { target: { value: 'es' } });
      expect(getByText('Language has been changed to Spanish')).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('calls ignored pages function correctly', async () => {
      jest.spyOn(LangConfig.prototype, 'LANGUAGES_IGNORE_PAGES').mockImplementation((pathname) => {
        return true;
      });
      const { getByText } = render(<LangConfig lang="en" ignorePages={['/blog']} />);
      expect(LangConfig.LANGUAGES_IGNORE_PAGES('/blog')).toBe(true);
    });
  });

  it('renders snapshot correctly', async () => {
    const mockedLangs = [
      {
        lang: 'en',
        fallback: false,
      },
      {
        lang: 'es',
        fallback: true,
      },
    ];
    const { container } = render(<LangConfig langs={mockedLangs} />);
    expect(container).toMatchSnapshot();
  });
});