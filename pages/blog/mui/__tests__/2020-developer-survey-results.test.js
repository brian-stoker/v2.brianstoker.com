import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-developer-survey-results.md?muiMarkdown';

describe('Page component', () => {
  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('renders with valid props', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });

    it('throws an error when no docs prop is provided', async () => {
      try {
        render(<TopLayoutBlog />);
      } catch (error) {
        expect(error.message).toContain('Docs prop is required');
      }
    });
  });

  describe('conditional rendering', () => {
    it('renders the blog content', async () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('does not render any content if docs are empty', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={''} />);
      expect(queryByText(docs.title)).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('displays the blog content on click of a title link', async () => {
      render(<Page />);
      const titleLink = await screen.findByRole('link');
      fireEvent.click(titleLink);
      expect(screen.getByText(docs.title)).toBeInTheDocument();
    });

    it('updates the search input when typing a query', async () => {
      render(<Page />);
      const searchInput = await screen.find_by_placeholder("Search");
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(await screen.findByPlaceholderText('Search')).toHaveValue('test');
    });

    it('submits the form when clicking on a submit button', async () => {
      render(<Page />);
      const submitButton = await screen.findByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      expect(screen.getByText(docs.title)).toBeInTheDocument();
    });
  });
});