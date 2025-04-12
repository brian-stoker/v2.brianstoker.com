import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file-element.json';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearMocksAll();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders ApiPage with descriptions and pageContent props', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      expect(ApiPage).toBeInTheDocument();
    });

    it('does not render ApiPage with invalid descriptions prop', async () => {
      const invalidTranslations = { invalidKey: 'value' };
      render(<Page descriptions={invalidTranslations} pageContent={jsonPageContent} />);
      expect(ApiPage).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error when descriptions prop is not an object', async () => {
      const invalidDescriptions = 'invalid value';
      await expect(() => render(<Page descriptions={invalidDescriptions} pageContent={jsonPageContent} />)).rejects.toThrow();
    });

    it('renders with valid descriptions and pageContent props', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      expect(ApiPage).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('renders ApiPage after clicking on a button', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      const button = await waitFor(() => expect(findElementByDataAttribute('button')).toBeInTheDocument());
      fireEvent.click(button);
      expect(ApiPage).toBeInTheDocument();
    });

    it('renders ApiPage after input change', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      const input = await waitFor(() => expect(findElementByDataAttribute('input')).toBeInTheDocument());
      fireEvent.change(input, { target: 'new value' });
      expect(ApiPage).toBeInTheDocument();
    });

    it('renders ApiPage after form submission', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      const input = await waitFor(() => expect(findElementByDataAttribute('input')).toBeInTheDocument());
      fireEvent.change(input, { target: 'new value' });
      const form = await waitFor(() => expect(findElementByDataAttribute('form')).toBeInTheDocument());
      fireEvent.submit(form);
      expect(ApiPage).toBeInTheDocument();
    });
  });

  describe('side effects', () => {
    it('updates pageContent prop when new content is received', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      let updatedTranslations;
      Page.getInitialProps.mockImplementationOnce(() => {
        updatedTranslations = translations;
        return { descriptions: translations, pageContent: jsonPageContent };
      });
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      const button = await waitFor(() => expect(findElementByDataAttribute('button')).toBeInTheDocument());
      fireEvent.click(button);
      expect(updatedTranslations).toBe(translations);
    });

    it('calls getInitialProps function when new content is received', async () => {
      const translations = mapApiPageTranslations(require.context(
        'translations/api-docs/file-explorer/file-element',
        false,
        /\.\/file-element.*.json$/,
      ));
      Page.getInitialProps.mockImplementationOnce(() => {
        return { descriptions: translations, pageContent: jsonPageContent };
      });
      render(<Page descriptions={translations} pageContent={jsonPageContent} />);
      const button = await waitFor(() => expect(findElementByDataAttribute('button')).toBeInTheDocument());
      fireEvent.click(button);
      expect(Page.getInitialProps).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with snapshot', async () => {
    const translations = mapApiPageTranslations(require.context(
      'translations/api-docs/file-explorer/file-element',
      false,
      /\.\/file-element.*.json$/,
    ));
    render(<Page descriptions={translations} pageContent={jsonPageContent} />);
    expect(renderedComponent).toMatchSnapshot();
  });
});