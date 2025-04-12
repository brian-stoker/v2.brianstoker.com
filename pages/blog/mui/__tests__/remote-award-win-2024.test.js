import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './remote-award-win-2024.md?muiMarkdown';

describe('Page component', () => {
  const docsMock = { content: {} };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docsMock} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when docs prop is provided', () => {
      const { container } = render(<TopLayoutBlog docs={docsMock} />);
      expect(container).toHaveTextContent(/content/);
    });

    it('does not render when docs prop is not provided', async () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).not.toContainElement(expect.any(ReactElement));
    });
  });

  describe('prop validation', () => {
    it('validates when docs prop is an object', async () => {
      const { container } = render(<TopLayoutBlog docs={docsMock} />);
      expect(container).toHaveTextContent(/content/);
    });

    it('does not validate when docs prop is null or undefined', async () => {
      const { container, getByText } = render(<TopLayoutBlog docs={null} />);
      expect(getByText('Error: Docs prop is required')).toBeInTheDocument();
    });

    it('does not validate when docs prop is an array', async () => {
      const { container, getByText } = render(<TopLayoutBlog docs={['not an object']} />);
      expect(getByText('Error: Docs prop must be an object')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onDocClick when clicked', async () => {
      const onDocClickSpy = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docsMock} onClick={onDocClickSpy} />);
      const link = getByText(/content/);
      fireEvent.click(link);
      expect(onDocClickSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onDocHover when hovered', async () => {
      const onDocHoverSpy = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docsMock} onDocHover={onDocHoverSpy} />);
      const link = getByText(/content/);
      fireEvent.mouseOver(link);
      expect(onDocHoverSpy).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when form is submitted', async () => {
      const onSubmitSpy = jest.fn();
      const { getByLabelText, getByText } = render(<TopLayoutBlog docs={docsMock} onSubmit={onSubmitSpy} />);
      const form = getByLabelText('Search');
      fireEvent.change(form, { target: { value: 'search query' } });
      fireEvent.submit(form);
      expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('renders docs content after API call completes', async () => {
      const getDocsSpy = jest.fn(() => Promise.resolve(docsMock));
      const { container, getByText } = render(<TopLayoutBlog docs={null} getDocs={getDocsSpy} />);
      expect(getByText(/content/)).not.toBeInTheDocument();
      await waitFor(() => expect(container).toHaveTextContent(/content/));
    });

    it('renders error message when API call fails', async () => {
      const getDocsSpy = jest.fn(() => Promise.reject(new Error('API failed')));
      const { container, getByText } = render(<TopLayoutBlog docs={null} getDocs={getDocsSpy} />);
      expect(getByText(/Error: Docs prop is required/)).toBeInTheDocument();
    });
  });

  it('renders snapshot', async () => {
    const { asFragment } = render(<TopLayoutBlog docs={docsMock} />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});