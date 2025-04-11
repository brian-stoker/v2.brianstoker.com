import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from './lab-date-pickers-to-mui-x.test.js';

describe('TopLayoutBlog component', () => {
  const docs = [];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).not.toBeNull();
    });

    it('renders when given valid props', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders without crashing when docs prop is empty array', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { container } = render(<TopLayoutBlog docs={[]} />);
      expect(container).not.toBeNull();
    });

    it('renders without crashing when docs prop contains valid data', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Prop Validation', () => {
    it('throws error if docs prop is not an array', async () => {
      await expect(() => render(<TopLayoutBlog docs="not an array" />)).toThrowError(
        'Invalid prop type: expected "docs" to be an array, received a string',
      );
    });

    it('throws error if docs prop is null or undefined', async () => {
      await expect(() =>
        render(<TopLayoutBlog docs={null} />, { disableTestFrameworkAssertion: true }),
      ).toThrowError(
        'Invalid prop type: expected "docs" to be an array, received a null',
      );
    });
  });

  describe('User Interactions', () => {
    it('does not throw error when clicking on component', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const linkElement = getByText('Click here');
      fireEvent.click(linkElement);
      expect(linkElement).toBeInTheDocument();
    });

    it('does not throw error when input field is changed', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { getByPlaceholderText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const inputElement = getByPlaceholderText('Enter text');
      fireEvent.change(inputElement, { target: { value: 'Hello' } });
      expect(getByRole('textbox')).toHaveValue('Hello');
    });

    it('does not throw error when form is submitted', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} />);
      const submitButton = getByText('Submit');
      fireEvent.click(submitButton);
      expect(getByText('Form submitted')).toBeInTheDocument();
    });
  });

  describe('Side Effects', () => {
    it('calls fetch function when component mounts', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });
  });

  describe('Mock External Dependencies', () => {
    it('renders without crashing when fetch function is mocked', async () => {
      global.fetch.mockReturn Promise.resolve();
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).not.toBeNull();
    });
  });
});