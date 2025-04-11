import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './date-pickers-stable-v5.md?muiMarkdown';

describe('Page component', () => {
  const docProps = {
    title: 'Test Docs',
    content: 'This is some test content.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TopLayoutBlog docs={docProps} />);
    expect(screen).toBeTruthy();
  });

  it('renders top layout blog with docs prop', () => {
    const { container } = render(<TopLayoutBlog docs={docProps} />);
    expect(container).toHaveTextContent(docProps.title);
  });

  describe('rendering props validation', () => {
    it('should validate docs prop as an object', () => {
      expect(
        render(<TopLayoutBlog docs={{}} />,
      ).container
      ).not.toHaveClass('error');
    });

    it('should not validate docs prop as undefined', () => {
      expect(
        render(<TopLayoutBlog docs={undefined} />,
      ).container
      ).toHaveClass('error');
    });

    it('should validate docs prop as an array', () => {
      expect(
        render(<TopLayoutBlog docs={['Test Docs']} />,
      ).container
      ).not.toHaveClass('error');
    });
  });

  describe('user interactions', () => {
    const docProps = {
      title: 'Test Docs',
      content: 'This is some test content.',
    };

    beforeEach(() => {
      render(<TopLayoutBlog docs={docProps} />);
    });

    it('should click on the document title and navigate to a new page', () => {
      const titleElement = screen.getByText(docProps.title);
      fireEvent.click(titleElement);
      expect(document.location).toBe('/new-page');
    });

    it('should type in the search input field and see the results', () => {
      render(<TopLayoutBlog docs={docProps} />);
      const searchInputField = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInputField, { target: { value: 'test' } });
      expect(screen.getByText('Search result')).toBeInTheDocument();
    });

    it('should submit the form and see the results', () => {
      render(<TopLayoutBlog docs={docProps} />);
      const searchForm = screen.getByRole('form');
      fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'test' } });
      fireEvent.submit(searchForm);
      expect(screen.getByText('Search result')).toBeInTheDocument();
    });
  });

  describe('snapshot tests', () => {
    it('renders as expected', () => {
      const wrapper = render(<TopLayoutBlog docs={docProps} />);
      expect(wrapper).toMatchSnapshot();
    });
  });
});