import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2022-tenerife-retreat.md?muiMarkdown';

describe('Page component', () => {
  const docsTest = docs;

  beforeEach(() => {
    jest.clearMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docsTest} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders top layout blog when props are provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docsTest} />);
      expect(getByText('Page Title')).toBeInTheDocument();
    });

    it('does not render when no props are provided', async () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    const invalidDocsProp = null;

    it('throws an error when invalid props are passed', async () => {
      await expect(() => render(<TopLayoutBlog docs={invalidDocsProp} />)).rejects.toThrowError(
        expect.stringContaining('docs must be provided')
      );
    });

    it('does not throw an error when valid props are passed', async () => {
      const { container } = render(<TopLayoutBlog docs={docsTest} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('allows clicking on button', async () => {
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docsTest} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByText('Button text')).toBeInTheDocument();
    });

    it('allows inputting search query', async () => {
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={docsTest} />);
      const inputField = getByPlaceholderText('Search query');
      fireEvent.change(inputField, { target: { value: 'testQuery' } });
      expect(getByRole('button')).toHaveAttribute('aria-label', 'Search');
    });

    it('submits search form', async () => {
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={docsTest} />);
      const inputField = getByPlaceholderText('Search query');
      const button = getByRole('button');
      fireEvent.change(inputField, { target: { value: 'testQuery' } });
      fireEvent.click(button);
      await waitFor(() => expect(getByRole('form')).toHaveAttribute('submit', true));
    });
  });

  describe('side effects', () => {
    it('renders page when data is fetched from API', async () => {
      // mock API call to fetch data
      const fetchData = jest.fn();
      fetchData.mockResolvedValue({ data: docsTest });
      const { getByText } = render(<TopLayoutBlog docs={null} />);
      fireEvent.click(getByText('Fetch Data Button'));
      await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1));
    });

    it('does not fetch data when API call fails', async () => {
      // mock API call to fetch data
      const fetchData = jest.fn();
      fetchData.mockRejectedValue(new Error('API failed'));
      const { getByText } = render(<TopLayoutBlog docs={null} />);
      fireEvent.click(getByText('Fetch Data Button'));
      await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot', async () => {
    const { asFragment } = render(<TopLayoutBlog docs={docsTest} />);
    expect(asFragment()).toMatchSnapshot();
  });
});