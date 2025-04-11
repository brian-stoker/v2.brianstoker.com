import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from '../components/TopLayoutBlog';
import { docs } from './lab-tree-view-to-mui-x.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<!DOCTYPE html><html><head></head><body></body></html>';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('validates docs prop is not null or undefined', () => {
      expect(
        render(<TopLayoutBlog docs={null} />)
          .throws(Error)
      ).toBe(true);
    });

    it('validates docs prop is an object', () => {
      expect(
        render(<TopLayoutBlog docs={{}} />)
          .throws(Error)
      ).toBe(true);
    });
  });

  describe('User interactions', () => {
    it('calls callback when clicking on a doc title', async () => {
      const handleDocClick = jest.fn();
      render(<TopLayoutBlog docs={docs} onDocClick={handleDocClick} />);
      fireEvent.click(screen.getByText('Doc Title'));
      expect(handleDocClick).toHaveBeenCalledTimes(1);
    });

    it('calls callback when inputting a search query', async () => {
      const handleSearch = jest.fn();
      render(<TopLayoutBlog docs={docs} onSearch={handleSearch} />);
      fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'query' } });
      expect(handleSearch).toHaveBeenCalledTimes(1);
    });

    it('calls callback when clicking submit', async () => {
      const handleSubmit = jest.fn();
      render(<TopLayoutBlog docs={docs} onSubmit={handleSubmit} />);
      fireEvent.click(screen.getByText('Submit'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});