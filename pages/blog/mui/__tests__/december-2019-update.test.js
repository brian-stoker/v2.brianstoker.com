/**
 * December 2019 Update Test
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './december-2019-update.md?muiMarkdown';

describe('TopLayoutBlog', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render(<Page />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('renders without crashing', () => {
    it('should render the component without errors', async () => {
      expect(wrapper).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    const invalidDocs = {};

    it('should display default content when no docs are provided', () => {
      wrapper = render(<TopLayoutBlog docs={invalidDocs} />);
      expect(wrapper.getByText('Default Content')).toBeInTheDocument();
    });

    it('should display the correct content for a valid docs prop', async () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => getByText('Doc 1'));
      await waitFor(() => getByText('Doc 2'));
      expect(getByText('Doc 1')).toBeInTheDocument();
      expect(getByText('Doc 2')).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('should throw an error when docs is not provided', async () => {
      const invalidProps = { invalidProp: 'invalidValue' };
      expect(() => render(<TopLayoutBlog {...invalidProps} />)).toThrowError(
        'Docs prop is required',
      );
    });

    it('should display default content when docs are missing or null', async () => {
      wrapper = render(<TopLayoutBlog docs={null} />);
      expect(wrapper.getByText('Default Content')).toBeInTheDocument();
      expect(wrapper.getByText('Invalid doc format')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    const mockDocs = { title: 'Mock Docs' };

    it('should handle a click on the title', async () => {
      wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      const titleElement = wrapper.getByText(mockDocs.title);
      fireEvent.click(titleElement);
      expect(wrapper.getByRole('region')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('should handle a form submission', async () => {
      wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      const form = wrapper.getByRole('form');
      fireEvent.change(form, { target: { value: 'newValue' } });
      fireEvent.submit(form);
      expect(wrapper.getByText(mockDocs.title)).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('should handle an input change', async () => {
      wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      const inputElement = wrapper.getByPlaceholderText('New Value');
      fireEvent.change(inputElement, { target: { value: 'newValue' } });
      expect(wrapper.getByRole('region')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    it('should handle a focus change', async () => {
      wrapper = render(<TopLayoutBlog docs={mockDocs} />);
      const titleElement = wrapper.getByText(mockDocs.title);
      fireEvent.focus(titleElement);
      expect(wrapper.getByRole('region')).toHaveAttribute(
        'aria-focused',
        'true',
      );
    });
  });

  describe('side effects', () => {
    it('should trigger an update on the docs prop', async () => {
      const mockUpdate = jest.fn();
      wrapper = render(<TopLayoutBlog docs={mockDocs} update={mockUpdate} />);
      expect(mockUpdate).not.toHaveBeenCalled();
      fireEvent.change(wrapper.getByPlaceholderText('New Value'), {
        target: { value: 'newValue' },
      });
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  // Snapshot test
  it('should render the component with correct snapshot', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });
});