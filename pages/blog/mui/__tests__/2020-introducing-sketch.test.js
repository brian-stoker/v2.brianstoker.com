import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-introducing-sketch.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    // setup mock props
    jest.clearAllMocks();
  });

  afterEach(() => {
    // restore original window.location.href
    global.window.location.href = 'https://example.com';
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders correctly with valid props', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('2020 Introducing Sketch')).toBeInTheDocument();
    });

    it('renders a fallback message with invalid props', async () => {
      const { getByText } = render(<TopLayoutBlog docs="" />);
      expect(getByText('Error: Invalid prop')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeTruthy();
    });

    it('rejects invalid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs="" />);
      expect(getByText('Error: Invalid prop')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    let component;

    beforeEach(() => {
      component = render(<TopLayoutBlog docs={docs} />);
    });

    it('calls onClick handler on click', async () => {
      const mockOnClick = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onClick={mockOnClick} />);
      fireEvent.click(getByText('2020 Introducing Sketch'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit handler on form submission', async () => {
      const mockOnSubmit = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onSubmit={mockOnSubmit} />);
      fireEvent.change(getByText('Search'), { target: { value: 'hello' } });
      fireEvent.submit(getByRole('form'));
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('displays a loading message when rendering', async () => {
    const { getByText } = render(<TopLayoutBlog docs={docs} />);
    await waitFor(() => expect(getByText('Loading...')).toBeInTheDocument());
  });

  // snapshot test for rendering
  it('renders correctly', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});