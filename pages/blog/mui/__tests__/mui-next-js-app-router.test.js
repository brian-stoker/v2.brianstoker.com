import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-next-js-app-router.md?muiMarkdown';

jest.mock('./mui-next-js-app-router.md');

describe('Page component', () => {
  const props = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('renders TopLayoutBlog component with props', async () => {
    const { getByText } = render(<TopLayoutBlog {...props} />);
    expect(getByText(props.docs.title)).toBeInTheDocument();
  });

  it('displays blog content on page load', async () => {
    const { getByText } = render(<TopLayoutBlog {...props} />);
    await waitFor(() => getByText(props.docs.content));
    expect(getByText(props.docs.content)).toBeInTheDocument();
  });

  it('renders error message when prop is missing', async () => {
    const missingPropComponent = render(<TopLayoutBlog docs={null} />);
    const errorMessage = missingPropComponent.getByText('Error: docs prop is required');
    expect(errorMessage).toBeInTheDocument();
  });

  it('renders error message when prop value is invalid', async () => {
    const invalidPropComponent = render(<TopLayoutBlog docs="invalid" />);
    const errorMessage = invalidPropComponent.getByText('Error: Invalid docs format');
    expect(errorMessage).toBeInTheDocument();
  });

  it('handles user interaction (clicking on blog post)', async () => {
    const { getByText } = render(<TopLayoutBlog {...props} />);
    const blogPostElement = getByText(props.docs.content);
    fireEvent.click(blogPostElement);
    expect(blogPostElement).toHaveClass('active');
  });

  it('handles user interaction (typing in search input)', async () => {
    const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog {...props} />);
    const searchInput = getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(getByRole('search')).toHaveValue('test');
  });

  it('renders as a page', async () => {
    render(<TopLayoutBlog {...props} />);
    const pageContainer = document.querySelector('main');
    expect(pageContainer).toBeInTheDocument();
  });
});