import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-v4-is-out.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  const defaultProps = {
    docs: docs,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await render(<TopLayoutBlog {...defaultProps} />);
  });

  describe('Conditional rendering', () => {
    it('renders when props.docs are provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(/Material-UI v4 is out/)).toBeInTheDocument();
    });

    it('does not render when props.docs are not provided', async () => {
      const { queryByText } = render(<TopLayoutBlog />);
      expect(queryByText(/Material-UI v4 is out/)).not.toBeInTheDocument();
    });
  });

  describe('Prop validation', () => {
    it('rejects invalid docs prop type', async () => {
      await expect(
        render(<TopLayoutBlog docs={null} />)
      ).rejects.toThrowError('Invalid props:(docs)');
    });

    it('accepts valid docs prop type', async () => {
      await render(<TopLayoutBlog docs={docs} />);
    });
  });

  describe('User interactions', () => {
    it('calls the correct function when clicked', async () => {
      const mockFunction = jest.fn();
      const { getByText } = render(
        <TopLayoutBlog docs={docs} onClick={mockFunction} />
      );
      const button = getByText(/Material-UI v4 is out/);
      fireEvent.click(button);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls the correct function when input changes', async () => {
      const mockFunction = jest.fn();
      const { getByLabelText, getByRole } = render(
        <TopLayoutBlog docs={docs} onChange={mockFunction} />
      );
      const inputField = getByLabelText(/Input field/);
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls the correct function when form is submitted', async () => {
      const mockFunction = jest.fn();
      const { getByRole } = render(
        <TopLayoutBlog docs={docs} onSubmit={mockFunction} />
      );
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  it('re-renders when component is updated', async () => {
    const { rerender } = render(<TopLayoutBlog docs={docs} />);
    await waitFor(() => expect(rerender).toHaveBeenCalledTimes(1));
  });
});