import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './michal-dudak-joining.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders correctly', () => {
    it('should render without crashing', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });

    it('should render TopLayoutBlog component with correct props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should reject non-object props', async () => {
      const invalidProps = 'not an object';
      await expect(() => render(<TopLayoutBlog docs={invalidProps} />)).rejects.toThrowError(
        'docs prop must be an object',
      );
    });

    it('should reject missing props', async () => {
      const missingProps = { /* some props are present */ };
      await expect(() => render(<TopLayoutBlog docs={missingProps} />)).rejects.toThrowError(
        'docs prop is required',
      );
    });
  });

  describe('conditional rendering', () => {
    it('should render TopLayoutBlog component when docs prop is truthy', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });

    it('should not render TopLayoutBlog component when docs prop is falsy', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={false} />);
      expect(queryByText(docs.title)).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should trigger clicks on links within docs prop', async () => {
      const mockLinkClicks = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      fireEvent.click(getByText(docs.title));
      expect(mockLinkClicks).toHaveBeenCalledTimes(1);
    });

    it('should update search query when input field changes', async () => {
      const mockSearchQueryChanges = jest.fn(() => null);
      const { getByPlaceholderText, byValue } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('Search');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(mockSearchQueryChanges).toHaveBeenCalledTimes(1);
    });

    it('should submit form when search query changes', async () => {
      const mockFormSubmission = jest.fn();
      const { getByPlaceholderText, byValue } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('Search');
      fireEvent.change(inputField, { target: { value: 'test' } });
      fireEvent.submit(byValue);
      expect(mockFormSubmission).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('should update docs prop when search query changes', async () => {
      const mockSearchQueryChanges = jest.fn(() => ({ title: 'newTitle' }));
      const { getByPlaceholderText, byValue } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('Search');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(mockSearchQueryChanges).toHaveBeenCalledTimes(1);
    });
  });

  describe('snapshots', () => {
    it('should render correct layout', async () => {
      const wrapper = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(wrapper.container).toMatchSnapshot());
    });
  });
});