import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './build-layouts-faster-with-grid-v2.md?muiMarkdown';

describe('Page component', () => {
  it('renders without crashing', async () => {
    const props = {};
    const { container } = render(<TopLayoutBlog docs={docs} {...props} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders blog content when docs prop is present', async () => {
      const props = { docs: docs };
      const { getByText, queryByText } = render(<TopLayoutBlog docs={docs} {...props} />);
      expect(getByText(props.docs.title)).toBeInTheDocument();
      expect(queryByText(props.docs.description)).not.toBeInTheDocument();
    });

    it('renders empty state when docs prop is absent', async () => {
      const props = {};
      const { getByText, queryByText } = render(<TopLayoutBlog docs={docs} {...props} />);
      expect(getByText('No blog content available')).toBeInTheDocument();
      expect(queryByText(props.docs.title)).not.toBeInTheDocument();
    });
  });

  it('validates prop type', async () => {
    const invalidProps = { foo: 'bar' };
    const { error } = render(<TopLayoutBlog docs={docs} {...invalidProps} />);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('Invalid prop: "foo"');
  });

  it('handles click event on blog title', async () => {
    const onClickMock = jest.fn();
    const props = { docs: docs, onClick: onClickMock };
    const { getByText } = render(<TopLayoutBlog docs={docs} {...props} />);
    const blogTitle = getByText(props.docs.title);
    fireEvent.click(blogTitle);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('handles input change on search bar', async () => {
    const onChangeMock = jest.fn();
    const props = { docs: docs, onChange: onChangeMock };
    const { getByPlaceholderText } = render(<TopLayoutBlog docs={docs} {...props} />);
    const searchBar = getByPlaceholderText('Search blog...');
    fireEvent.change(searchBar, { target: { value: 'example' } });
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('submits form when search button is clicked', async () => {
    const onSubmitMock = jest.fn();
    const props = { docs: docs, onSubmit: onSubmitMock };
    const { getByPlaceholderText, getByText } = render(<TopLayoutBlog docs={docs} {...props} />);
    const searchBar = getByPlaceholderText('Search blog...');
    const searchButton = getByText('Search');
    fireEvent.click(searchButton);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('handles side effect when blog content is loaded', async () => {
    const props = { docs: docs };
    const { rerender } = render(<TopLayoutBlog docs={docs} {...props} />);
    await waitFor(() => expect(props.docs).not.toBe undefined);
    expect(rerender).toHaveBeenCalledTimes(1);
  });
});