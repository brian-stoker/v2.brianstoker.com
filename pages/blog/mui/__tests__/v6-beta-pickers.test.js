import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './v6-beta-pickers.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders without crashing', () => {
    it('should render successfully', () => {
      const props = { docs };
      render(<TopLayoutBlog {...props} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should render when docs is provided', () => {
      const props = { docs: 'docs content' };
      render(<TopLayoutBlog {...props} />);
      expect(screen.getByRole('dialog')).toHaveTextContent('docs content');
    });

    it('should not render when docs is not provided', () => {
      const props = {};
      render(<TopLayoutBlog {...props} />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('should validate docs prop as string', () => {
      const props = { docs: 'docs content' };
      render(<TopLayoutBlog {...props} />);
      expect(screen.getByRole('dialog')).toHaveTextContent('docs content');
    });

    it('should not validate docs prop as non-string', () => {
      const props = { docs: undefined, otherProp: 'value' };
      render(<TopLayoutBlog {...props} />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('should trigger opening dialog on click', async () => {
      const props = { docs: 'docs content' };
      render(<TopLayoutBlog {...props} />);
      await waitFor(() => screen.getByRole('button'));
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should trigger closing dialog on click', async () => {
      const props = { docs: 'docs content' };
      render(<TopLayoutBlog {...props} />);
      await waitFor(() => screen.getByRole('button'));
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('side effects', () => {
    it('should update docs state when new content is provided', async () => {
      const props = { docs: 'new docs content' };
      render(<TopLayoutBlog {...props} />);
      await waitFor(() => screen.getByRole('dialog'));
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('dialog')).toHaveTextContent('new docs content');
    });
  });
});