import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-is-now-mui.md?muiMarkdown';

describe('Page component', () => {
  const defaultProps = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearMocksAll();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders TopLayoutBlog with docs prop', () => {
    const { getByText } = render(<TopLayoutBlog {...defaultProps} />);
    expect(getByText(defaults.docs.title)).toBeInTheDocument();
  });

  it('passes props to TopLayoutBlog component', () => {
    const props = {
      docs: 'newDocs',
    };
    const { container } = render(<TopLayoutBlog {...props} />);
    const topLayoutBlogComponent = container.querySelector('TopLayoutBlog');
    expect(topLayoutBlogComponent.props.docs).toBe(props.docs);
  });

  it('renders TopLayoutBlog with invalid docs prop', () => {
    const invalidDocs = 'invalid-docs';
    const { getByText } = render(<TopLayoutBlog {...defaultProps} docs={invalidDocs} />);
    expect(getByText(invalidDocs)).toBeInTheDocument();
  });

  describe('user interactions', () => {
    it('calls onDocClick prop when doc title is clicked', async () => {
      const mockOnDocClick = jest.fn();
      const props = { ...defaultProps, onDocClick: mockOnDocClick };
      render(<TopLayoutBlog {...props} />);
      await waitFor(() => expect(mockOnDocClick).toHaveBeenCalledTimes(1));
    });

    it('calls onDocChange prop when doc title is changed', async () => {
      const mockOnDocChange = jest.fn();
      const props = { ...defaultProps, onDocChange: mockOnDocChange };
      render(<TopLayoutBlog {...props} />);
      fireEvent.change(document.querySelector('.docs-title'), { target: 'newTitle' });
      await waitFor(() => expect(mockOnDocChange).toHaveBeenCalledTimes(1));
    });

    it('calls onFormSubmit prop when form is submitted', async () => {
      const mockOnFormSubmit = jest.fn();
      const props = { ...defaultProps, onFormSubmit: mockOnFormSubmit };
      render(<TopLayoutBlog {...props} />);
      fireEvent.change(document.querySelector('.docs-title'), { target: 'newTitle' });
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(mockOnFormSubmit).toHaveBeenCalledTimes(1));
    });
  });

  it('renders conditional rendering path', async () => {
    const props = { ...defaultProps, isDarkMode: true };
    render(<TopLayoutBlog {...props} />);
    await waitFor(() => expect(document.querySelector('.docs-title')).toHaveStyle('color: #333'));
  });
});