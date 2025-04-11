import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering tests', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('renders TopLayoutBlog with correct props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    // Add more rendering tests as needed
  });

  describe('Prop validation tests', () => {
    it('passes valid prop', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('throws error on invalid prop', async () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).toThrowError(
        'Docs is required'
      );
    });

    // Add more prop validation tests as needed
  });

  describe('User interaction tests', () => {
    it('renders correctly after clicking', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
      fireEvent.click(getByText('Click me'));
      await waitFor(() => expect(getByText(docs.title)).toBeInTheDocument());
    });

    it('updates state on input change', async () => {
      const { getByPlaceholderText, getByText } = render(<TopLayoutBlog docs={docs} />);
      const input = getByPlaceholderText('Input');
      fireEvent.change(input, { target: { value: 'New value' } });
      expect(getByText('Updated')).toBeInTheDocument();
    });

    // Add more user interaction tests as needed
  });

  describe('Side effects and state changes', () => {
    it('calls API on mount', async () => {
      const apiCallMock = jest.fn();
      render(<TopLayoutBlog docs={docs} apiCall={apiCallMock} />);
      expect(apiCallMock).toHaveBeenCalledTimes(1);
    });

    // Add more side effect tests as needed
  });
});