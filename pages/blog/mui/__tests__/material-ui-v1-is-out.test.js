import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-v1-is-out.md?muiMarkdown';

describe('Page component', () => {
  const mockDocs = docs;

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(screen.getByRole('document')).toBeInTheDocument();
  });

  describe('props validation', () => {
    it('should throw an error when docs prop is missing', () => {
      const { error } = render(<TopLayoutBlog />);
      expect(error).toBeInstanceOf(Error);
    });

    it('should not throw an error when docs prop is present', () => {
      render(<TopLayoutBlog docs={mockDocs} />);
    });
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component', () => {
      render(<Page />);
      expect(screen.getByRole('document')).toBeInTheDocument();
    });

    it('should not render anything when docs prop is missing', () => {
      const { queryByRole } = render(<TopLayoutBlog />);
      expect(queryByRole('document')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should click on TopLayoutBlog link', async () => {
      const mockGetIdFromProps = jest.fn();
      const { getByText, getByRole } = render(<Page />);
      const topLayoutBlogLink = getByRole('link');
      fireEvent.click(topLayoutBlogLink);
      expect(mockGetIdFromProps).toHaveBeenCalledTimes(1);
    });
  });

  it('should update docs prop on change', async () => {
    const mockGetIdFromProps = jest.fn();
    render(<Page />);
    const(docsInput) = screen.getByPlaceholderText('docs');
    fireEvent.change(docsInput, { target: { value: 'new-docs' } });
    expect(mockGetIdFromProps).toHaveBeenCalledTimes(1);
  });

  it('should submit form', async () => {
    const mockGetIdFromProps = jest.fn();
    render(<Page />);
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    expect(mockGetIdFromProps).toHaveBeenCalledTimes(1);
  });
});

export default { };