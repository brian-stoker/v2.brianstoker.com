import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-q3-update.md?muiMarkdown';

describe('Page', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page.container).not.toBeNull();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts docs prop', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('rejects invalid docs prop (not a string)', () => {
      expect(() => render(<TopLayoutBlog docs={123} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('clicks on TopLayoutBlog component triggers click event', async () => {
      const { getByText, getByRole } = page;
      await waitFor(() => getByRole('button'));
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText(docs.title)).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Snapshot Test', () => {
    it('renders as expected', () => {
      expect(document.body).toMatchSnapshot();
    });
  });
});