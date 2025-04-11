import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-q1-update.md?muiMarkdown';

describe('Page', () => {
  const mockedDocs = docs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={mockedDocs} />);
    expect(container).not.toBeNull();
  });

  describe('conditional rendering paths', () => {
    it('renders with docs prop provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockedDocs} />);
      await waitFor(() => expect(getByText(/docs/i)).toBeInTheDocument());
    });

    it('does not render without docs prop provided', async () => {
      const { container } = render(<TopLayoutBlog />);
      expect(container).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('accepts valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockedDocs} />);
      await waitFor(() => expect(getByText(/docs/i)).toBeInTheDocument());
    });

    it('does not accept invalid docs prop (string)', async () => {
      const { container } = render(<TopLayoutBlog docs="invalid" />);
      expect(container).toBeNull();
    });
  });

  describe('user interactions', () => {
    const mockedDocsUpdated = mockedDocs;
    const mockedUpdateFunction = jest.fn();

    beforeEach(() => {
      mockedDocsUpdated.forEach((doc) => {
        doc.update = mockedUpdateFunction;
      });
    });

    it('calls update function when docs prop updated', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockedDocs} />);
      await waitFor(() => expect(mockedUpdateFunction).toHaveBeenCalledTimes(1));
      fireEvent.change(getByText(/docs/i), { target: 'new value' });
      await waitFor(() => expect(mockedUpdateFunction).toHaveBeenCalledTimes(2));
    });

    it('does not call update function when docs prop changed', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockedDocs} />);
      fireEvent.change(getByText(/docs/i), { target: 'new value' });
      await waitFor(() => expect(mockedUpdateFunction).not.toHaveBeenCalled());
    });
  });

  describe('side effects or state changes', () => {
    it('updates docs prop when fetch is called', async () => {
      const mockedFetch = jest.fn();
      const { rerender } = render(<TopLayoutBlog docs={mockedDocs} />);
      await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1));
      rerender(<TopLayoutBlog docs={mockedDocs} />);
      await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    });
  });

  describe('snapshot test', () => {
    it('matches snapshot for valid props', async () => {
      const { asFragment } = render(<TopLayoutBlog docs={mockedDocs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});