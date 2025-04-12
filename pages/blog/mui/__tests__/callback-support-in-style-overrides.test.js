import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './callback-support-in-style-overrides.md?muiMarkdown';

describe('TopLayoutBlog Component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering Props', () => {
    it('renders without crashing with valid props', () => {
      const { container } = page;
      expect(container).toBeTruthy();
    });

    it('throws an error when docs prop is not provided', () => {
      const { container } = render(<TopLayoutBlog />);
      expect(container).toBeNull();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders the correct component based on the docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('renders a default component when docs prop is not provided', () => {
      const { getByText } = render(<TopLayoutBlog />);
      expect(getByText(TopLayoutBlog.defaultProps.title)).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when docs prop is invalid', () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).toBeNull();
    });

    it('throws an error when docs prop is not a string', () => {
      const { container } = render(<TopLayoutBlog docs={123} />);
      expect(container).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('calls the callback function on button click', async () => {
      const callbackMock = jest.fn();
      const { getByText, getByRole } = page;
      const button = getByRole('button');
      fireEvent.click(button);
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });

    it('updates the text input value on change', async () => {
      const { getByLabelText, getByRole } = page;
      const inputField = getByLabelText('Input Field');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(getByLabelText('Input Field').value).toBe('new value');
    });

    it('submits the form on submit', async () => {
      const { getByRole, getByText } = page;
      const button = getByText('Submit');
      fireEvent.submit(button);
      expect(getByText('Form submitted')).toBeInTheDocument();
    });
  });

  describe('Side Effects and State Changes', () => {
    it('renders the updated content on re-render', async () => {
      const callbackMock = jest.fn();
      render(<Page callback={callbackMock} />);
      expect(callbackMock).toHaveBeenCalledTimes(1);
    });
  });

  // Snapshot test
  it('renders correctly with valid props and no errors', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});