import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Page from './file-explorer-basic.test.js';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file-explorer-basic.json';

describe('File Explorer Basic', () => {
  const mockedTranslations = jest.fn();

  beforeEach(() => {
    mockedTranslations.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<Page />);
      expect(container).toBeInTheDocument();
    });

    it('renders translations correctly', async () => {
      const translations = ['Translation 1', 'Translation 2'];
      mockedTranslations.mockImplementation(() => translations);

      const { getByText } = render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      expect(getByText(translations[0])).toBeInTheDocument();
    });

    it('renders content correctly', async () => {
      const { getByText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      expect(getByText(jsonPageContent.title)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('validates descriptions prop as array', () => {
      expect.assertions(1);
      const invalidDescription = 'Invalid description';
      const { container } = render(<Page descriptions={invalidDescription} pageContent={jsonPageContent} />);
      expect(container).not.toBeInTheDocument();
    });

    it('validates content prop as JSON object', () => {
      expect.assertions(1);
      const invalidContent = 'Invalid content';
      const { container } = render(<Page descriptions={} pageContent={invalidContent} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('clicks on translations toggle button', async () => {
      const mockedToggleTranslations = jest.fn();

      const { getByText, getByRole } = render(<Page descriptions={['Translation 1']} pageContent={jsonPageContent} />);
      expect(getByText('Show/hide translations')).toBeInTheDocument();
      fireEvent.click(getByRole('button'));

      expect(mockedToggleTranslations).toHaveBeenCalledTimes(1);
    });

    it('clicks on content toggle button', async () => {
      const mockedToggleContent = jest.fn();

      const { getByText, getByRole } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      expect(getByText(jsonPageContent.title)).toBeInTheDocument();
      fireEvent.click(getByRole('button'));

      expect(mockedToggleContent).toHaveBeenCalledTimes(1);
    });

    it('submits form', async () => {
      const mockedSubmitForm = jest.fn();

      const { getByLabelText } = render(<Page descriptions={[]} pageContent={jsonPageContent} />);
      const formElement = getByLabelText('Search file');
      fireEvent.change(formElement, { target: { value: 'searchValue' } });
      fireEvent.click(getByRole('button'));

      expect(mockedSubmitForm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side Effects', () => {
    it('maps translations correctly on initial render', async () => {
      const mockedMapApiPageTranslations = jest.fn();

      const { getByText } = render(<Page />);
      await waitFor(() => expect(mockedMapApiPageTranslations).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshot Test', () => {
    it('renders as expected', () => {
      const { container } = render(<Page />);
      expect(container).toMatchSnapshot();
    });
  });
});