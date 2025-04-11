import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';

jest.mock('./bringing-consistency-to-material-ui-customization-apis.md');

describe('Page component', () => {
  const docs = require('./bringing-consistency-to-material-ui-customization-apis.md').muiMarkdown;

  beforeEach(() => {
    global.document = { createElement: jest.fn() };
  });

  afterEach(() => {
    global.document = null;
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  it('renders TopLayoutBlog component with docs prop', async () => {
    const { getByText } = render(<TopLayoutBlog docs={docs} />);
    expect(getByText('bringing-consistency-to-material-ui-customization-apis')).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog component when docs is truthy', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(' bringing-consistency-to-material-ui-customization-apis')).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog component when docs is falsy', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText('bringing-consistency-to-material-ui-customization-apis')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws error when docs is null or undefined', async () => {
      await expect(() => render(<TopLayoutBlog docs={null} />)).rejects.toThrow();
      await expect(() => render(<TopLayoutBlog docs={undefined} />)).rejects.toThrow();
    });

    it('does not throw error when docs is truthy', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText('bringing-consistency-to-material-ui-customization-apis')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls props.docs when clicked', async () => {
      const mockDocs = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      const element = getByText('bringing-consistency-to-material-ui-customization-apis');
      fireEvent.click(element);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('calls props.docs when input changes', async () => {
      const mockDocs = jest.fn();
      const { getByText, getByLabelText } = render(<TopLayoutBlog docs={mockDocs} />);
      const element = getByText('bringing-consistency-to-material-ui-customization-apis');
      const inputElement = getByLabelText('input');
      fireEvent.change(inputElement, { target: { value: 'new value' } });
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });

    it('does not call props.docs when form is submitted', async () => {
      const mockDocs = jest.fn();
      const { getByText, getByLabelText } = render(<TopLayoutBlog docs={mockDocs} />);
      const element = getByText('bringing-consistency-to-material-ui-customization-apis');
      const inputElement = getByLabelText('input');
      fireEvent.change(inputElement, { target: { value: 'new value' } });
      const form = getByRole('form');
      fireEvent.submit(form);
      expect(mockDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('calls props.docs when component mounts', async () => {
      const mockDocs = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      await waitFor(() => expect(mockDocs).toHaveBeenCalledTimes(1));
    });
  });
});