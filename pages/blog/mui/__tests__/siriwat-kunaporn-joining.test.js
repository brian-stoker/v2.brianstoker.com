import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './siriwat-kunaporn-joining.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders blog content when docs prop is provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText('blog-content')).toBeInTheDocument());
    });

    it('renders default content when docs prop is not provided', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      await waitFor(() => expect(getByText('default-content')).toBeInTheDocument());
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is null or undefined', () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).toThrowError();
      expect(() => render(<TopLayoutBlog docs={undefined} />)).toThrowError();
    });

    it('does not throw an error when docs prop is a valid markdown string', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText('blog-content')).toBeInTheDocument());
    });
  });

  describe('user interactions', () => {
    it('renders blog content when clicked on blog link', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const blogLink = getByRole('button');
      fireEvent.click(blogLink);
      await waitFor(() => expect(getByText('blog-content')).toBeInTheDocument());
    });

    it('renders default content when clicked on link', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog />);
      const link = getByRole('link');
      fireEvent.click(link);
      await waitFor(() => expect(getByText('default-content')).toBeInTheDocument());
    });
  });

  describe('state changes', () => {
    it('updates the blog content when docs prop changes', async () => {
      const { rerender } = render(<TopLayoutBlog docs={docs} />);
      expect(rerender).toHaveBeenCalledTimes(1);
    });

    it('does not update the default content when docs prop does not change', async () => {
      const { rerender } = render(<TopLayoutBlog />);
      expect(rerender).not.toHaveBeenCalled();
    });
  });

  describe('mocks and side effects', () => {
    jest.mock('./api/get-blog-content', () => ({
      __esModule: true,
      default: async (markdown) => ({ markdown }),
    }));

    it('renders blog content when mocked getBlogContent API returns data', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText('blog-content')).toBeInTheDocument());
    });
  });

  describe('snapshot testing', () => {
    it('renders the same layout as expected', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });
  });
});