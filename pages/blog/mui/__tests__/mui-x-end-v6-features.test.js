import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-end-v6-features.md?muiMarkdown';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Page />);
    expect(document.body).not.toBeNull();
  });

  describe('Conditional Rendering', () => {
    it('renders when docs prop is provided', () => {
      const { container } = render(<Page docs={docs} />);
      expect(container).toHaveTextContent(docs);
    });

    it('does not render when docs prop is empty', () => {
      const { container } = render(<Page docs="" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Prop Validation', () => {
    it('throws an error when docs prop is undefined', () => {
      expect(() => <Page docs={undefined} />).toThrowError();
    });

    it('passes validation when docs prop is valid', () => {
      const { container } = render(<Page docs={docs} />);
      expect(container).toHaveTextContent(docs);
    });
  });

  describe('User Interactions', () => {
    it('calls onDocSelected callback when onDocSelected event is triggered', async () => {
      const mockCallback = jest.fn();
      render(<TopLayoutBlog onDocSelected={mockCallback} docs={docs} />);
      fireEvent.click(document.querySelector('.doc-list-item'));
      await waitFor(() => expect(mockCallback).toHaveBeenCalledTimes(1));
    });

    it('calls form submission handler when form is submitted', async () => {
      const mockHandler = jest.fn();
      render(<TopLayoutBlog onDocSelected={mockCallback} docs={docs} />);
      fireEvent.change(document.querySelector('.form-field'), { target: { value: 'new-value' } });
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(mockHandler).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot', () => {
    const { asFragment } = render(<Page />);
    expect(asFragment()).toMatchSnapshot();
  });
});