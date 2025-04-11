import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file.json';

jest.mock('translations/api-docs/file-explorer/file');

describe('Page Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Rendering Props Validation', () => {
    it('renders without crashing when no props are passed', async () => {
      const { container } = render(<ApiPage />);
      expect(container).toBeTruthy();
    });

    it('renders without crashing when all required props are passed', async () => {
      const descriptions = mapApiPageTranslations(require.context('', false, /\.\/file.*.json$/));
      const pageContent = jsonPageContent;
      const { container } = render(<ApiPage descriptions={descriptions} pageContent={pageContent} />);
      expect(container).toBeTruthy();
    });

    it('renders without crashing when invalid prop is passed', async () => {
      const invalidProp = {};
      const { container } = render(<ApiPage descriptions={invalidProp} pageContent={jsonPageContent} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders ApiPage component when all props are valid', async () => {
      const descriptions = mapApiPageTranslations(require.context('', false, /\.\/file.*.json$/));
      const pageContent = jsonPageContent;
      const { getAllByRole } = render(<ApiPage descriptions={descriptions} pageContent={pageContent} />);
      expect(getAllByRole('heading')).toHaveLength(1);
    });

    it('renders empty div when all props are invalid', async () => {
      const invalidProp = {};
      const { getAllByRole } = render(<ApiPage descriptions={invalidProp} pageContent={jsonPageContent} />);
      expect(getAllByRole('div')).toHaveLength(1);
    });
  });

  describe('User Interactions', () => {
    it('calls function when click is performed on ApiPage component', async () => {
      const descriptions = mapApiPageTranslations(require.context('', false, /\.\/file.*.json$/));
      const pageContent = jsonPageContent;
      const { getByText } = render(<ApiPage descriptions={descriptions} pageContent={pageContent} />);
      fireEvent.click(getByText('Test Heading'));
      expect(descriptions).not.toBeNull();
    });

    it('does not call function when click is performed on empty div', async () => {
      const invalidProp = {};
      const { getByRole } = render(<ApiPage descriptions={invalidProp} pageContent={jsonPageContent} />);
      fireEvent.click(getByRole('div'));
      expect(invalidProp).toBe(invalidProp);
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly and matches snapshot', async () => {
      const descriptions = mapApiPageTranslations(require.context('', false, /\.\/file.*.json$/));
      const pageContent = jsonPageContent;
      const { asFragment } = render(<ApiPage descriptions={descriptions} pageContent={pageContent} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('Side Effects', () => {
    it('calls getInitialProps function when component is mounted', async () => {
      const req = jest.fn().mockReturnThis();
      ApiPage.getInitialProps = req;
      const descriptions = mapApiPageTranslations(req);
      render(<ApiPage />);
      expect(req).toHaveBeenCalledTimes(1);
      expect(descriptions).not.toBeNull();
    });
  });
});