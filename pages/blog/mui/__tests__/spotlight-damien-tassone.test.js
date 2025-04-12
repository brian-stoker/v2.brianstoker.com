import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './spotlight-damien-tassone.md?muiMarkdown';

describe('Spotlight Damien Tassone Page', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<html><body></body></html>';
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('Props validation', () => {
    const validDocs = docs;
    const invalidDocs = null;

    it('accepts valid documents', () => {
      render(<Page docs={validDocs} />);
      expect(TopLayoutBlog.props.docs).toBe(validDocs);
    });

    it('rejects invalid documents', () => {
      render(<Page docs={invalidDocs} />);
      expect(TopLayoutBlog.props.docs).toBe(null);
      expect(TopLayoutBlog.error).toBeUndefined();
    });
  });

  describe('User interactions', () => {
    let input;

    beforeEach(() => {
      input = page.getByPlaceholderText('Enter text');
    });

    it('updates document title on input change', () => {
      const newDocTitle = 'New Document Title';
      fireEvent.change(input, { target: { value: newDocTitle } });
      waitFor(() => expect(TopLayoutBlog.props.title).toBe(newDocTitle));
    });

    it('submits form on click', async () => {
      const submitButton = page.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      await waitFor(() => expect(TopLayoutBlog.state.submitting).toBe(false));
    });

    it('renders loading state on submit', async () => {
      document.body.style.display = 'none';
      const submitButton = page.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      await waitFor(() => expect(TopLayoutBlog.state.submitting).toBe(true));
    });

    it('closes loading state on successful submission', async () => {
      document.body.style.display = 'none';
      const submitButton = page.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      await waitFor(() => expect(TopLayoutBlog.state.submitting).toBe(false));
    });
  });

  describe('Conditional rendering', () => {
    it('renders top layout blog component when documents are valid', () => {
      render(<Page docs={validDocs} />);
      expect(page.getByRole('heading', { name: 'Top Layout Blog' })).toBeInTheDocument();
    });

    it('does not render top layout blog component when documents are invalid', () => {
      render(<Page docs={invalidDocs} />);
      expect(page.queryByRole('heading', { name: 'Top Layout Blog' })).toBeNull();
    });
  });

  describe('Snapshot tests', () => {
    const validDocs = docs;

    it('renders correctly with valid documents', () => {
      const { container } = render(<Page docs={validDocs} />);
      expect(container).toMatchSnapshot();
    });

    it('renders correctly with invalid documents', () => {
      const { container } = render(<Page docs={invalidDocs} />);
      expect(container).toMatchSnapshot();
    });
  });
});