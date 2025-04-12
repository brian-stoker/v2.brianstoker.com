import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './march-2019-update.md?muiMarkdown';

describe('TopLayoutBlog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog />);
    expect(container).toMatchSnapshot();
  });

  describe('props validation', () => {
    const validProps = {
      docs: docs,
    };

    it('should validate all props', async () => {
      const { getByText } = render(<TopLayoutBlog {...validProps} />);
      await waitFor(() => getByText('Test Title'));
      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('should not render with invalid props', async () => {
      const invalidProps = {};

      const { container } = render(<TopLayoutBlog {...invalidProps} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('renders when docs prop is provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => getByText('Test Title'));
      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('does not render when docs prop is empty', async () => {
      const { container } = render(<TopLayoutBlog docs="" />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    let doc;

    beforeEach(() => {
      doc = docs;
    });

    it('should trigger onRender event when rendered', async () => {
      const { getByText } = render(<TopLayoutBlog docs={doc} />);
      await waitFor(() => getByText('Test Title'));
      expect(TopLayoutBlog.onRender).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onRender event when not rendered', async () => {
      const { container } = render(<TopLayoutBlog />);
      expect(TopLayoutBlog.onRender).not.toHaveBeenCalled();
    });

    it('should update docs prop correctly on render changes', async () => {
      let docUpdated;
      TopLayoutBlog.onUpdateDoc = (doc) => {
        docUpdated = doc;
      };

      const { getByText } = render(<TopLayoutBlog docs={doc} />);
      await waitFor(() => getByText('Test Title'));
      expect(TopLayoutBlog.onUpdateDoc).toHaveBeenCalledTimes(1);
      expect(TopLayoutBlog.onUpdateDoc).toHaveBeenCalledWith(doc);
    });
  });

  describe('side effects', () => {
    it('should render correctly when data is fetched', async () => {
      const fetchMock = jest.fn();
      fetchMock.mockReturnValue(Promise.resolve({}));

      const { getByText } = render(<TopLayoutBlog docs={doc} />);
      await waitFor(() => getByText('Test Title'));
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});

const TopLayoutBlogMock = () => {
  return <div />; // mock component
};