import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-the-row-grouping-feature.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { container } = page;
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument();
      expect(container.querySelector('TopLayoutBlog')).toHaveAttribute('docs', docs);
    });
  });

  describe('Props validation', () => {
    it('allows valid docs prop', () => {
      const { container } = render(<Page docs={docs} />);
      expect(container.querySelector('TopLayoutBlog')).toBeInTheDocument();
      expect(container.querySelector('TopLayoutBlog')).toHaveAttribute('docs', docs);
    });

    it('throws an error with invalid docs prop (string)', () => {
      const { error } = render(<Page docs="invalid" />, { throwError: true });
      expect(error).toBeInstanceOf(Error);
    });

    it('throws an error with invalid docs prop (undefined)', () => {
      const { error } = render(<Page docs={undefined} />, { throwError: true });
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('User interactions', () => {
    it('renders TopLayoutBlog component on page load', () => {
      expect(page).toBeTruthy();
    });

    it('clicks on TopLayoutBlog component renders the docs content', async () => {
      const { getByText } = page;
      const btn = getByText('Read More');
      fireEvent.click(btn);
      await waitFor(() => {
        expect(getByText(docs)).toBeInTheDocument();
      });
    });

    it('inputs in search bar and sees updated results', async () => {
      const { getByPlaceholderText, getByRole } = page;
      const searchInput = getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'example' } });
      await waitFor(() => {
        expect(getByRole('listitem')).toHaveTextContent(/Example/i);
      });
    });

    it('submits the form and sees updated results', async () => {
      const { getByPlaceholderText, getByRole } = page;
      const searchInput = getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'example' } });
      const form = getByRole('form');
      fireEvent.submit(form);
      await waitFor(() => {
        expect(getByRole('listitem')).toHaveTextContent(/Example/i);
      });
    });
  });

  describe('Side effects and state changes', () => {
    it('renders the docs content after clicking on a doc link', async () => {
      const { getByText } = page;
      const btn = getByText(docs);
      fireEvent.click(btn);
      await waitFor(() => {
        expect(getByText(docs)).toBeInTheDocument();
      });
    });

    it('removes the docs content after clicking on remove button', async () => {
      const { getByText } = page;
      const btn = getByText('Remove');
      fireEvent.click(btn);
      await waitFor(() => {
        expect(getByText(docs)).not.toBeInTheDocument();
      });
    });
  });
});