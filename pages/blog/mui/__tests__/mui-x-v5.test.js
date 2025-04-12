import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

describe('Page', () => {
  const docs = require('./mui-x-v5.md').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    expect(() => render(<Page />)).not.toThrow();
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog with docs prop', async () => {
      const { container } = render(<Page />);
      await waitFor(() => container);
      expect(container).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog without docs prop', async () => {
      const { container } = render(<Page />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid docs prop', async () => {
      const { container } = render(<Page docs={docs} />);
      await waitFor(() => container);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid docs prop (string)', async () => {
      expect(() => render(<Page docs="invalid" />)).toThrowError();
    });

    it('rejects invalid docs prop (object without docs property)', async () => {
      expect(() => render(<Page docs={{}} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('calls(docs) function when clicked', async () => {
      const mockDocs = jest.fn();
      const { container, getByText } = render(<Page docs={mockDocs} />);
      await waitFor(() => container);
      expect(mockDocs).not.toHaveBeenCalled();

      fireEvent.click(getByText('Render'));
      await waitFor(() => container);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('calls(docs) function when input changed', async () => {
      const mockDocs = jest.fn();
      const { container, getByPlaceholderText } = render(<Page docs={mockDocs} />);
      await waitFor(() => container);

      userEvent.type(getByPlaceholderText('doc title'), 'new doc');
      expect(mockDocs).not.toHaveBeenCalled();

      await waitFor(() => container);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('calls(docs) function when form submitted', async () => {
      const mockDocs = jest.fn();
      const { container, getByPlaceholderText } = render(<Page docs={mockDocs} />);
      await waitFor(() => container);

      userEvent.type(getByPlaceholderText('doc title'), 'new doc');
      fireEvent.change(getByPlaceholderText('doc content'), { target: { value: 'example' } });
      expect(mockDocs).not.toHaveBeenCalled();

      await waitFor(() => container);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with mock docs', async () => {
    const mockDocs = ['doc1', 'doc2'];
    const { container } = render(<Page docs={mockDocs} />);
    await waitFor(() => container);
    expect(container).toBeInTheDocument();
  });
});