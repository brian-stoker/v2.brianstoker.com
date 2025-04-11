import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './october-2019-update.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('accepts valid props', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid props - missing docs prop', async () => {
      await waitFor(() => expect(() => render(<TopLayoutBlog />)).not.toThrowError());
      await waitFor(() => expect(() => render(<TopLayoutBlog docs="" />)).toThrowError());
    });
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component when docs prop is truthy', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toHaveTextContent(docs);
    });

    it('renders fallback message when docs prop is falsy', async () => {
      await waitFor(() => expect(() => render(<TopLayoutBlog docs="" />)).not.toThrowError());
      const { getByText } = render(<TopLayoutBlog docs="" />);
      expect(getByText('No documentation available')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('does not trigger re-render on docs prop change', async () => {
      const initialDocs = docs;
      const newDocs = { ...initialDocs, title: 'New Title' };
      const { rerender } = render(<TopLayoutBlog docs={initialDocs} />);
      await waitFor(() => expect(document.querySelector('p')).not.toHaveTextContent('New Title'));
      rerender(<TopLayoutBlog docs={newDocs} />);
      await waitFor(() => expect(document.querySelector('p')).toHaveTextContent(initialDocs.title));
    });

    it('updates the container when docs prop changes', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText(docs)).toBeInTheDocument());
      const newDocs = { ...docs, title: 'New Title' };
      const { rerender } = render(<TopLayoutBlog docs={newDocs} />);
      await waitFor(() => expect(getByText(newDocs.title)).toBeInTheDocument());
    });
  });

  describe('snapshot tests', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});