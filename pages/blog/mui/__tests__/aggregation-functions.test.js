import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './aggregation-functions.md?muiMarkdown';

describe('Page component', () => {
  const mockedDocs = JSON.parse(JSON.stringify(docs)); // Mock docs for testing
  const pageProps = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockedDocs.title = 'Test Docs';
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={mockedDocs} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders title if docs are provided', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockedDocs} />);
      expect(getByText('Test Docs')).toBeInTheDocument();
    });

    it('does not render title if no docs are provided', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={} />);
      expect(queryByText('Test Docs')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is null or undefined', () => {
      expect(() => <TopLayoutBlog docs={null} />).toThrowError();
      expect(() => <TopLayoutBlog docs={} />).toThrowError();
    });

    it('does not throw an error when docs prop is provided with valid data', async () => {
      const { container } = render(<TopLayoutBlog docs={mockedDocs} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('handles click on the title', async () => {
      const mockedClickHandler = jest.fn();
      const { getByText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onClick={mockedClickHandler} />
        </div>,
      );
      const titleElement = getByText('Test Docs');
      fireEvent.click(titleElement);
      expect(mockedClickHandler).toHaveBeenCalledTimes(1);
    });

    it('handles input changes', async () => {
      const mockedInputChange = jest.fn();
      const { getByPlaceholderText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onChange={mockedInputChange} />
        </div>,
      );
      const inputElement = getByPlaceholderText('Enter text');
      fireEvent.change(inputElement, { target: { value: 'test' } });
      expect(mockedInputChange).toHaveBeenCalledTimes(1);
    });

    it('handles form submission', async () => {
      const mockedSubmitHandler = jest.fn();
      const { getByPlaceholderText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onSubmit={mockedSubmitHandler} />
        </div>,
      );
      const inputElement = getByPlaceholderText('Enter text');
      fireEvent.change(inputElement, { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));
      expect(mockedSubmitHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('calls the onClick prop function when clicked', async () => {
      const mockedClickHandler = jest.fn();
      const { getByText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onClick={mockedClickHandler} />
        </div>,
      );
      const titleElement = getByText('Test Docs');
      fireEvent.click(titleElement);
      expect(mockedClickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls the onChange prop function when input changes', async () => {
      const mockedInputChange = jest.fn();
      const { getByPlaceholderText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onChange={mockedInputChange} />
        </div>,
      );
      const inputElement = getByPlaceholderText('Enter text');
      fireEvent.change(inputElement, { target: { value: 'test' } });
      expect(mockedInputChange).toHaveBeenCalledTimes(1);
    });

    it('calls the onSubmit prop function when form is submitted', async () => {
      const mockedSubmitHandler = jest.fn();
      const { getByPlaceholderText } = render(
        <div>
          <TopLayoutBlog docs={mockedDocs} onSubmit={mockedSubmitHandler} />
        </div>,
      );
      const inputElement = getByPlaceholderText('Enter text');
      fireEvent.change(inputElement, { target: { value: 'test' } });
      fireEvent.submit(document.querySelector('form'));
      expect(mockedSubmitHandler).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with snapshot', async () => {
    const { container } = render(<TopLayoutBlog docs={mockedDocs} />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});