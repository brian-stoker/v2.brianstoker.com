import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutCareers from 'src/modules/components/TopLayoutCareers';
import pageProps from 'pages/careers/full-stack-engineer.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    jest.resetAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders title when pageProps.title is provided', async () => {
      const props = { ...pageProps, title: 'Test Title' };
      const { getByText } = render(<TopLayoutCareers {...props} />);
      expect(getByText('Test Title')).toBeInTheDocument();
    });

    it('does not render title when pageProps.title is not provided', async () => {
      const props = { ...pageProps, title: undefined };
      const { queryByText } = render(<TopLayoutCareers {...props} />);
      expect(queryByText('Title')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('renders without crashing with valid props', async () => {
      const props = { ...pageProps };
      const { container } = render(<TopLayoutCareers {...props} />);
      expect(container).toBeInTheDocument();
    });

    it('throws an error when pageProps.title is not a string', async () => {
      const props = { ...pageProps, title: 123 };
      try {
        render(<TopLayoutCareers {...props} />);
        assert.fail('Expected Error Not Thrown');
      } catch (error) {
        expect(error.message).toBe('Invalid type for prop "title". Expected string, but received number.');
      }
    });
  });

  describe('user interactions', () => {
    it('calls onClick when button is clicked', async () => {
      const mockOnClick = jest.fn();
      const props = { ...pageProps, onClick: mockOnClick };
      render(<TopLayoutCareers {...props} />);
      const button = await getComputedStyle(document.querySelector('button')).display;
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('updates state when input field changes', async () => {
      const mockUpdateState = jest.fn();
      const props = { ...pageProps, updateState: mockUpdateState };
      render(<TopLayoutCareers {...props} />);
      const inputField = await getComputedStyle(document.querySelector('input')).display;
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      expect(mockUpdateState).toHaveBeenCalledTimes(1);
    });

    it('submits form when submit button is clicked', async () => {
      const mockSubmitForm = jest.fn();
      const props = { ...pageProps, submitForm: mockSubmitForm };
      render(<TopLayoutCareers {...props} />);
      const submitButton = await getComputedStyle(document.querySelector('button[type="submit"]')).display;
      fireEvent.click(submitButton);
      expect(mockSubmitForm).toHaveBeenCalledTimes(1);
    });
  });

  it('renders correctly with props', async () => {
    const { container } = render(<TopLayoutCareers {...pageProps} />);
    expect(container).toMatchSnapshot();
  });
});