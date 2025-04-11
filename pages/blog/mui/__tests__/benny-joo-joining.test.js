import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './benny-joo-joining.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('accepts valid docs prop', () => {
      const mockedGetByText = jest.fn();
      render(<Page docs={docs} />);
      expect(mockedGetByText).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid docs prop (non-object)', () => {
      expect(() => render(<Page docs="not an object" />)).toThrowError();
    });
  });

  describe('User interactions', () => {
    it(' renders TopLayoutBlog component when the button is clicked', async () => {
      const { getByRole } = page;
      const button = getByRole('button');
      fireEvent.click(button);
      expect(getByRole('text')).toBeInTheDocument();
    });

    it(' updates text on input change', async () => {
      const { getByPlaceholderText, getByRole } = page;
      const inputField = getByPlaceholderText('text input');
      fireEvent.change(inputField, { target: { value: 'New text' } });
      expect(getByRole('text')).toBeInTheDocument();
    });

    it(' submits form when submit button is clicked', async () => {
      const { getByRole, getByLabelText } = page;
      const submitButton = getByRole('button');
      const inputField = getByLabelText('Submit Form');
      fireEvent.click(submitButton);
      expect(getByRole('text')).toBeInTheDocument();
    });
  });

  describe('Snapshot test', () => {
    it('renders correctly', async () => {
      const mockedGetByText = jest.fn();
      render(<Page />);
      await waitFor(() => expect(mockedGetByText).toHaveBeenCalledTimes(1));
      expect(page).toMatchSnapshot();
    });
  });
});