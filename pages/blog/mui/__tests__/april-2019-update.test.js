import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './april-2019-update.md?muiMarkdown';

describe('Page component', () => {
  const mockDocs = {
    // Mocked docs data for testing purposes
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TopLayoutBlog docs={mockDocs} />);
    expect(React.findDOMNode).not.toHaveBeenCalledError();
  });

  describe('conditional rendering', () => {
    it('renders top layout blog when docs are provided', () => {
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(getByText('Mocked Docs Title')).toBeInTheDocument();
    });

    it('renders default content when no docs are provided', () => {
      const { getByText } = render(<TopLayoutBlog docs={null} />);
      expect(getByText('Default Content')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('validates that docs is required prop', () => {
      const { error } = render(<TopLayoutBlog docs={undefined} />);
      expect(error).not.toBeNull();
    });

    it('validates that docs is object type', () => {
      const { error } = render(<TopLayoutBlog docs="invalid" />);
      expect(error).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls callback when user clicks on button', async () => {
      const onButtonClick = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} onClick={onButtonClick} />);
      const button = getByText('Button Text');
      fireEvent.click(button);
      expect(onButtonClick).toHaveBeenCalledTimes(1);
    });

    it('calls callback when user types in input', async () => {
      const onInputChange = jest.fn();
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={mockDocs} onChange={onInputChange} />);
      const input = getByPlaceholderText('Input Placeholder');
      fireEvent.change(input, { target: { value: 'Mocked Input Value' } });
      expect(onInputChange).toHaveBeenCalledTimes(1);
    });

    it('submits form when user submits', async () => {
      const onSubmit = jest.fn();
      const { getByRole } = render(<TopLayoutBlog docs={mockDocs} onSubmit={onSubmit} />);
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('calls api request when user clicks on button', async () => {
      jest.mocked fetch).mockResolvedValue({
        json: () => ({ data: 'Mocked Data' }),
      });
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      const button = getByText('Button Text');
      fireEvent.click(button);
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });

    it('calls callback when user types in input', async () => {
      jest.mocked useEffect).mockImplementationOnce((callback) => {
        callback();
      });
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={mockDocs} onChange={() => {}} />);
      const input = getByPlaceholderText('Input Placeholder');
      fireEvent.change(input, { target: { value: 'Mocked Input Value' } });
      await waitFor(() => expect(useEffect).toHaveBeenCalledTimes(1));
    });
  });

  it('snapshot test', () => {
    render(<TopLayoutBlog docs={mockDocs} />);
    expect(getByText('Mocked Docs Title')).toHaveStyle('color: blue');
  });
});