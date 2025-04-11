import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './build-layouts-faster-with-grid-v2.md?muiMarkdown';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop when provided', async () => {
      const { container } = render(<Page />);
      expect(container.children[0]).toBeInstanceOf(TopLayoutBlog);
      expect(container.children[0].props.docs).toBe(docs);
    });

    it('does not render TopLayoutBlog without docs prop', async () => {
      const { container } = render(<Page />); // eslint-disable-line react/forbid-prop-types
      expect(container.children.length).toBe(0);
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const mockDocs = { /* test data */ };
      const { container } = render(<Page docs={mockDocs} />);
      expect(container.children[0]).toBeInstanceOf(TopLayoutBlog);
      expect(container.children[0].props.docs).toBe(mockDocs);
    });

    it('does not accept invalid docs prop', async () => {
      // eslint-disable-next-line react/forbid-prop-types
      const { container } = render(<Page docs={null} />);
      expect(container.children.length).toBe(0);
    });
  });

  describe('user interactions', () => {
    it('calls TopLayoutBlog onClick handler when clicked', async () => {
      const mockOnLinkClick = jest.fn();
      const { getByText, getByRole } = render(<Page />);
      const linkElement = getByText(/Link/);
      fireEvent.click(linkElement);

      expect(mockOnLinkClick).toHaveBeenCalledTimes(1);
    });

    it('calls TopLayoutBlog onChange handler when input changes', async () => {
      const mockOnChange = jest.fn();
      const { getByRole } = render(<Page />);
      const inputElement = getByRole('textbox');

      fireEvent.change(inputElement, { target: { value: 'new value' } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('calls TopLayoutBlog onSubmit handler when form submitted', async () => {
      const mockOnSubmit = jest.fn();
      const { getByText, getByRole } = render(<Page />);
      const formElement = getByText(/Form/);

      fireEvent.submit(formElement);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls TopLayoutBlog fetch data when rendered', async () => {
      // Mock TopLayoutBlog's useEffect hook
      const mockUseEffect = jest.fn(() => {
        expect(true).toBe(true); // eslint-disable-line @typescript-eslint/no-empty-function
      });
      const { rerender } = render(<Page />);

      expect(mockUseEffect).toHaveBeenCalledTimes(1);
    });
  });

  it('renders snapshot', async () => {
    const { asFragment } = render(<Page />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});