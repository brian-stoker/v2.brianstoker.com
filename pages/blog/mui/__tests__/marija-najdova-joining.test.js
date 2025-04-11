import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './marija-najdova-joining.md?muiMarkdown';

describe('Page component', () => {
  const mockDocs = docs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(container).toBeInTheDocument();
  });

  it('renders all conditional rendering paths', () => {
    const { container } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(
      container.querySelector('.page-header')
    ).toBeInTheDocument();

    const { container: containerWithNoHeader } = render(<TopLayoutBlog docs={mockDocs} header={false} />);
    expect(containerWithNoHeader.querySelector('.page-header')).not.toBeInTheDocument();
  });

  it('validates props', () => {
    // Test with valid props
    const { container } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(container).toBeInTheDocument();

    // Test with invalid props (non-object)
    expect(() => render(<TopLayoutBlog docs='not an object' />)).toThrowError();
  });

  it('handles user interactions', async () => {
    const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
    const button = getByText('Button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-checked', 'true');
  });

  it('handles form submission', async () => {
    const { getByLabelText, getByText } = render(<TopLayoutBlog docs={mockDocs} />);
    const inputField = getByLabelText('Input field');
    const submitButton = getByText('Submit');
    fireEvent.change(inputField, { target: { value: 'test' } });
    fireEvent.click(submitButton);
    await waitFor(() => expect(inputField).toHaveValue('test'));
  });

  it('renders correctly with empty docs', () => {
    const { container } = render(<TopLayoutBlog docs={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('renders correctly with undefined docs', () => {
    expect(() => render(<TopLayoutBlog docs={undefined} />)).toThrowError();
  });
});