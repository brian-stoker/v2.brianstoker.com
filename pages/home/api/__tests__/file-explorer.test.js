import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ApiPage from 'src/modules/components/ApiPage';
import mapApiPageTranslations from 'src/modules/utils/mapApiPageTranslations';
import jsonPageContent from './file-explorer.json';
import { describe, expect, beforeEach, afterEach } from 'vitest';

const Page = () => {
  return null;
};

describe('FileExplorer component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    page.unmount();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('props validation', () => {
    it('throws an error for invalid descriptions prop', async () => {
      const props = { pageContent: jsonPageContent };
      await expect(() => render(<Page {...props} descriptions={null} />)).rejects.toThrow(
        /descriptions is required/
      );
    });

    it('does not throw an error for valid descriptions prop', async () => {
      const props = { pageContent: jsonPageContent, descriptions: {} };
      await expect(() => render(<Page {...props} />)).not.toThrow();
    });
  });

  describe('conditional rendering', () => {
    it('renders ApiPage when pageContent is provided', () => {
      const props = { pageContent: jsonPageContent };
      const { getByText } = render(<Page {...props} />);
      expect(getByText('File Explorer')).toBeInTheDocument();
    });

    it('does not render ApiPage when pageContent is not provided', () => {
      const props = {};
      const { queryByText } = render(<Page {...props} />);
      expect(queryByText('File Explorer')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks on the link to navigate back', async () => {
      const props = { pageContent: jsonPageContent, descriptions: {} };
      const { getByRole, queryByRole } = render(<Page {...props} />);
      expect(getByRole('link')).toBeInTheDocument();
      fireEvent.click(getByRole('link'));
      expect(queryByRole('link')).not.toBeInTheDocument();
    });

    it('inputs a value and triggers a search', async () => {
      const props = { pageContent: jsonPageContent, descriptions: {} };
      const { getByPlaceholderText, getByRole } = render(<Page {...props} />);
      expect(getByPlaceholderText('Search')).toBeInTheDocument();
      fireEvent.change(getByPlaceholderText('Search'), { target: 'search value' });
      expect(getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    it('submits a form and triggers a search', async () => {
      const props = { pageContent: jsonPageContent, descriptions: {} };
      const { getByPlaceholderText, getByRole } = render(<Page {...props} />);
      expect(getByPlaceholderText('Search')).toBeInTheDocument();
      fireEvent.change(getByPlaceholderText('Search'), { target: 'search value' });
      fireEvent.click(getByRole('button', { name: 'Search' }));
      expect(getByRole('button', { name: 'Search' })).not.toBeInTheDocument();
    });
  });

  describe('side effects and state changes', () => {
    it('fetches translations on mount', async () => {
      const req = jest.fn(() => Promise.resolve({}));
      ApiPage.getInitialProps.mockImplementationOnce(() => ({ descriptions: {}, pageContent: jsonPageContent }));
      await render(<Page />);
      expect(req).toHaveBeenCalledTimes(1);
    });
  });

  it('matches the snapshot', () => {
    const props = { pageContent: jsonPageContent, descriptions: {} };
    render(<Page {...props} />);
    expect(page).toMatchSnapshot();
  });
});