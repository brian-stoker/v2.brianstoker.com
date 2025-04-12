import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './discord-announcement.md?muiMarkdown';

describe('Discord Announcement Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering Props', () => {
    it('renders with valid props', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });

    it('renders with invalid docs prop', () => {
      const { container } = render(<TopLayoutBlog docs="" />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders top layout blog correctly', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => getByText('Discord Announcement'));
      expect(getByText('Discord Announcement')).toBeInTheDocument();
    });

    it('renders fallback content when no docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog />);
      await waitFor(() => getByText('No announcement found'));
      expect(getByText('No announcement found')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('clicks on button triggers correct action', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText('Click me');
      fireEvent.click(button);
      expect(jest.fn()).toHaveBeenCalledTimes(1);
    });

    it('input changes update docs prop', async () => {
      const { getByPlaceholderText, getByText } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('New announcement text');
      fireEvent.change(inputField, { target: { value: 'Updated announcement' } });
      expect(getByText('Updated announcement')).toBeInTheDocument();
    });

    it('form submission updates docs prop', async () => {
      const { getByText, getByPlaceholderText } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('New announcement text');
      const button = getByText('Submit');
      fireEvent.change(inputField, { target: { value: 'Updated announcement' } });
      fireEvent.click(button);
      expect(getByText('Updated announcement')).toBeInTheDocument();
    });
  });

  describe('Side Effects', () => {
    it('calls correct function when docs prop updated', async () => {
      const mockUpdateDoc = jest.fn();
      render(<TopLayoutBlog docs={docs} updateDoc={mockUpdateDoc} />);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});