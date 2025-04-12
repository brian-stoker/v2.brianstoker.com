import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './docs-restructure-2022.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  it('renders without crashing', () => {
    expect(page).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      expect(page.getByText('Top Layout Blog')).toBeInTheDocument();
    });

    it('does not render anything when docs prop is missing', () => {
      const { container } = render(<Page />);
      expect(container).not.toContainElement(document.querySelector('div'));
    });
  });

  describe('prop validation', () => {
    it('renders with valid docs prop', () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText('Top Layout Blog')).toBeInTheDocument();
    });

    it('does not render when docs prop is invalid', () => {
      const invalidDocs = 'Invalid docs';
      const { container } = render(<Page docs={invalidDocs} />);
      expect(container).not.toContainElement(document.querySelector('div'));
    });
  });

  describe('user interactions', () => {
    it('clicks the Back to Table of Contents button', async () => {
      const backToTocButton = page.getByRole('button', { name: /back to table of contents/i });
      fireEvent.click(backToTocButton);
      await waitFor(() => expect(page).toMatchSnapshot());
    });

    it('navigates to the correct section when the Back to Table of Contents button is clicked', async () => {
      const tocLink = page.getByRole('link', { name: /table of contents/i });
      fireEvent.click(tocLink);
      await waitFor(() => expect(page).toMatchSnapshot());
    });

    it('submits a form when the table of contents button is clicked', async () => {
      const submitButton = page.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      await waitFor(() => expect(page).toMatchSnapshot());
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});