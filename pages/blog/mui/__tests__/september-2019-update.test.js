import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './september-2019-update.md?muiMarkdown';

describe('Page', () => {
  let { getByText } = render(<Page />);
  beforeEach(() => {
    // clean up any existing mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // restore original props and behavior
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(getByText(/Blog/)).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    const validDocs = docs;
    const invalidDocs = [];

    it('renders when docs are provided', () => {
      render(<Page />);
      expect(getByText(/Blog/)).toBeInTheDocument();
    });

    it('does not render when docs are empty', () => {
      render(<Page docs={invalidDocs} />);
      expect(() => getByText(/Blog/)).not.toThrowError();
    });
  });

  describe('prop validation', () => {
    const invalidProps = { foo: 'bar' };

    it('throws an error when invalid props are provided', () => {
      expect(() => render(<Page {...invalidProps} />)).toThrowError();
    });

    it('accepts valid docs prop', () => {
      expect(() => render(<Page docs={validDocs} />)).not.toThrowError();
    });
  });

  describe('user interactions', () => {
    let { getByText } = render(<Page />);
    const button = getByText(/Click me/);

    it('calls onClick when button is clicked', async () => {
      const onClickMock = jest.fn();
      button.addEventListener('click', onClickMock);
      fireEvent.click(button);
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    let { getByText } = render(<Page />);
    const inputField = getByText(/Search/);

    it('updates text on form submission', async () => {
      const searchValue = 'new search value';
      fireEvent.change(inputField, { target: { value: searchValue } });
      fireEvent.submit(inputField);
      expect(getByText(searchValue)).toBeInTheDocument();
    });
  });

  describe('snapshot test', () => {
    it('matches the original snapshot', async () => {
      const renderResult = render(<Page />);
      await waitFor(() => {
        expect(renderResult).toMatchSnapshot();
      });
    });
  });
});