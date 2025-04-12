import { render, fireEvent, waitFor } from '@testing-library/react';
import MarkdownDocs from './MarkdownDocs.test.js'; // adjust path according to your component location
import * as pageProps from 'data/home/docs/overview/overview.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    // Initialize test environment
    global.fetch = jest.fn(() => Promise.resolve({ json: () => ({ data: {} }) }));
  });

  afterEach(() => {
    // Clean up test environment
    global.fetch.mockReset();
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('renders MarkdownDocs component with pageProps when props are valid', () => {
      const { getByText } = render(<Page />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
      expect(getByText(pageProps.content)).toBeInTheDocument();
    });

    it('does not render anything when props are invalid (missing title)', () => {
      const invalidPageProps = { content: '<p>Hello World!</p>' };
      const { container } = render(<MarkdownDocs {...invalidPageProps} />);
      expect(container).not.toBeInTheDocument();
    });

    it('renders error message when props are invalid (missing content)', () => {
      const invalidPageProps = { title: 'Example' };
      const { getByText } = render(<MarkdownDocs {...invalidPageProps} />);
      expect(getByText('Error: Missing required prop "content"')).toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('passes valid props to MarkdownDocs component', () => {
      const { getByText } = render(<Page />);
      expect(getByText(pageProps.title)).toBeInTheDocument();
      expect(getByText(pageProps.content)).toBeInTheDocument();
    });

    it('throws error when props are invalid (missing title)', () => {
      const invalidPageProps = { content: '<p>Hello World!</p>' };
      expect(() => render(<MarkdownDocs {...invalidPageProps} />)).toThrowError(
        'Error: Missing required prop "title"'
      );
    });

    it('throws error when props are invalid (missing content)', () => {
      const invalidPageProps = { title: 'Example' };
      expect(() => render(<MarkdownDocs {...invalidPageProps} />)).toThrowError(
        'Error: Missing required prop "content"'
      );
    });
  });

  describe('User interactions', () => {
    it('renders correct content when navigating to next/previous page', async () => {
      const { getByText, getByRole } = render(<Page />);
      expect(getByText(pageProps.content)).toBeInTheDocument();

      fireEvent.click(getByRole('button', { name: 'Next' }));
      await waitFor(() => expect(getByText(pageProps.content)).not.toBeInTheDocument());
      expect(getByText(pageProps.nextContent)).toBeInTheDocument();

      fireEvent.click(getByRole('button', { name: 'Previous' }));
      await waitFor(() => expect(getByText(pageProps.content)).toBeVisible());
      expect(getByText(pageProps.previousContent)).not.toBeInTheDocument();
    });

    it('submits form when clicking on submit button', async () => {
      const { getByText, getByRole } = render(<Page />);
      expect(getByText(pageProps.content)).toBeInTheDocument();

      fireEvent.click(getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(getByText('Form submitted')).toBeInTheDocument());
    });

    it('renders form field changes when user types in input field', async () => {
      const { getByText, getByPlaceholderText } = render(<Page />);
      expect(getByText(pageProps.content)).toBeInTheDocument();

      fireEvent.change(getByPlaceholderText('input'), 'new text');
      await waitFor(() => expect(getByText('Updated input')).toBeInTheDocument());
    });
  });

  describe('Side effects or state changes', () => {
    it('calls fetch function when navigating to different page', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      const { getByText } = render(<Page />);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      fireEvent.click(getByRole('button', { name: 'Next' }));
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    });

    it('updates state when user submits form', async () => {
      const mockUpdateState = jest.fn();
      global.updateState = mockUpdateState;

      const { getByText, getByRole } = render(<Page />);
      expect(getByText(pageProps.content)).toBeInTheDocument();

      fireEvent.click(getByRole('button', { name: 'Submit' }));
      await waitFor(() => expect(mockUpdateState).toHaveBeenCalledTimes(1));
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});