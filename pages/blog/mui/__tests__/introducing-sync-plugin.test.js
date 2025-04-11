import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-sync-plugin.md?muiMarkdown';

jest.mock('./mocks', () => {
  return {
    TopLayoutBlog: jest.fn(),
  };
});

describe('Page component', () => {
  beforeEach(() => {
    global.document = { body: {} };
    document.body.innerHTML = '<html><head></head><body></body></html>';
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(/docs/i)).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog component without docs prop', () => {
      global.docs = null;
      const { queryByText } = render(<Page />);
      expect(queryByText(/docs/i)).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is not provided', async () => {
      expect(() => <Page />).toThrowError();
    });

    it('renders correctly with valid docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(/docs/i)).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls TopLayoutBlog component when clicked', async () => {
      const mockTopLayoutBlog = jest.fn();
      render(<TopLayoutBlog docs={docs} />);

      fireEvent.click(document.body);
      expect(mockTopLayoutBlog).toHaveBeenCalledTimes(1);
    });

    it('triggers an event on form submission', async () => {
      const mockTopLayoutBlog = jest.fn();
      const { getByText } = render(<Page />);
      const form = document.body.querySelector('form');

      fireEvent.change(form, { target: { value: 'test' } });
      fireEvent.submit(form);

      expect(mockTopLayoutBlog).toHaveBeenCalledTimes(1);
    });

    it('calls TopLayoutBlog component when input changes', async () => {
      const mockTopLayoutBlog = jest.fn();
      render(<Page />);
      const input = document.body.querySelector('input');

      fireEvent.change(input, { target: { value: 'test' } });
      expect(mockTopLayoutBlog).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('updates the component when data is fetched from an API call', async () => {
      const mockApiCall = jest.fn();
      render(<Page />);
      fireEvent.click(document.body);

      await waitFor(() => expect(mockApiCall).toHaveBeenCalledTimes(1));
    });
  });

  describe('snapshot test', () => {
    it('matches the expected snapshot', () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});