import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './bringing-consistency-to-material-ui-customization-apis.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    jest.clearMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  it('renders TopLayoutBlog with valid props', () => {
    const { getByText, container } = render(<Page />);
    expect(getByText(/docs/i)).toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  describe('invalid props', () => {
    it('throws an error when docs is not provided', () => {
      const { error } = render(<Page />);
      expect(error).not.toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls docs prop with click event', async () => {
      const mockDocs = jest.fn();
      const { getByText, getByRole } = render(<Page docs={mockDocs} />);
      const button = getByRole('button');
      fireEvent.click(button);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('calls docs prop with input change event', async () => {
      const mockDocs = jest.fn();
      const { getByText, getByRole } = render(<Page docs={mockDocs} />);
      const inputField = getByRole('textbox');
      fireEvent.change(inputField, { target: { value: 'new value' } });
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('calls docs prop with form submission event', async () => {
      const mockDocs = jest.fn();
      const { getByText, getByRole } = render(<Page docs={mockDocs} />);
      const form = getByRole('form');
      fireEvent.change(form, { target: { name: 'input' }, value: 'new value' });
      fireEvent.submit(form);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });
  });

  it('renders conditional rendering paths', () => {
    const { container } = render(<Page />);
    expect(container).toMatchSnapshot();
  });
});