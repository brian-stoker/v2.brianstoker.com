import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './matheus-wichman-joining.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders top layout blog with docs', () => {
      expect(page.getByRole('heading')).toHaveTextContent(docs.title);
    });

    it('renders default message when no docs available', async () => {
      const mockDocs = { title: '' };
      const { getByText } = render(<Page docs={mockDocs} />);
      await waitFor(() => getByText(mockDocs.title));
      expect(getByText(mockDocs.title)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid docs object', () => {
      const mockDocs = { title: 'Mock Title' };
      render(<Page docs={mockDocs} />);
      expect(page.getByRole('heading')).toHaveTextContent(mockDocs.title);
    });

    it('rejects invalid docs object', () => {
      const mockDocs = undefined;
      expect(() => render(<Page docs={mockDocs} />)).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('calls callback on button click', async () => {
      const mockOnButtonClicked = jest.fn();
      render(<Page docs={docs} onButtonClicked={mockOnButtonClicked} />);
      fireEvent.click(page.getByRole('button'));
      expect(mockOnButtonClicked).toHaveBeenCalledTimes(1);
    });

    it('updates input field value on input change', async () => {
      const mockOnChangeInputValue = jest.fn();
      render(<Page docs={docs} onInputChange={mockOnChangeInputValue} />);
      const inputField = page.getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'New Input Value' } });
      expect(mockOnChangeInputValue).toHaveBeenCalledTimes(1);
    });

    it('calls callback on form submission', async () => {
      const mockOnFormSubmit = jest.fn();
      render(<Page docs={docs} onFormSubmit={mockOnFormSubmit} />);
      fireEvent.submit(page.getByRole('form'));
      expect(mockOnFormSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Tests', () => {
    it('renders correctly', async () => {
      const mockDocs = { title: 'Mock Title' };
      await waitFor(() => render(<Page docs={mockDocs} />));
      expect(page).toMatchSnapshot();
    });
  });
});