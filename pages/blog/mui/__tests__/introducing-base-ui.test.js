import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-base-ui.md?muiMarkdown';

describe('Page component', () => {
  const mockDocs = [{ /* mock data */ }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(() => render(<Page />)).not.toThrowError();
  });

  describe('Conditional rendering', () => {
    it('renders TopLayoutBlog with docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(mockDocs[0].title)).toBeInTheDocument();
    });

    it('renders without docs prop', () => {
      const { queryByText } = render(<Page />); // Assuming a default doc title
      expect(queryByText('').not.toBeInTheDocument());
    });
  });

  describe('Prop validation', () => {
    it('throws error with invalid docs prop', () => {
      expect(() => render(<Page docs={null} />)).toThrowError();
    });

    it('renders with valid docs prop', () => {
      const { getByText } = render(<Page docs={mockDocs} />);
      expect(getByText(mockDocs[0].title)).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls callback when click on doc link', async () => {
      const mockCallback = jest.fn();
      const { getByText } = render(<Page docs={mockDocs} onClick={mockCallback} />);
      fireEvent.click(getByText(mockDocs[0].title));
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });

    it('calls callback when click on back link', async () => {
      const mockCallback = jest.fn();
      const { getByText } = render(<Page docs={mockDocs} onClick={mockCallback} />);
      fireEvent.click(getByText('Back to List'));
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });

    it('calls callback when input changes', async () => {
      const mockCallback = jest.fn();
      const { getByLabelText } = render(<Page docs={mockDocs} onChange={mockCallback} />);
      fireEvent.change(getByLabelText('Search by title'), 'new title');
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });

    it('calls callback when form submits', async () => {
      const mockCallback = jest.fn();
      const { getByText, getByLabel } = render(<Page docs={mockDocs} onSubmit={mockCallback} />);
      fireEvent.change(getByLabel('Search by title'), 'new title');
      fireEvent.click(getByText('Submit'));
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });
  });

  describe('Side effects and state changes', () => {
    it('calls callback when page loads', async () => {
      const mockCallback = jest.fn();
      render(<Page docs={mockDocs} onMount={mockCallback} />);
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });
  });

  test('renders with snapshot', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});