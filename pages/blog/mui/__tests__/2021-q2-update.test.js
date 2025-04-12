import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-q2-update.md?muiMarkdown';

describe('Page', () => {
  const mocks = {};

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('props validation', () => {
    it('renders with valid props', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('does not render with invalid props', () => {
      mocks TopLayoutBlog = jest.fn();
      const { error } = render(<TopLayoutBlog docs={null} />);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('conditional rendering', () => {
    it('renders documentation when docs prop is truthy', () => {
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      expect(getByText(/docs/i)).toBeTruthy();
    });

    it('does not render documentation when docs prop is falsy', () => {
      mocks TopLayoutBlog = jest.fn();
      const { queryByText } = render(<TopLayoutBlog docs={null} />);
      expect(queryByText(/docs/i)).toBeNull();
    });
  });

  describe('user interactions', () => {
    it('calls TopLayoutBlog component when rendered', () => {
      const mockRender = jest.fn();
      mocks TopLayoutBlog = { render: mockRender };
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    it('does not call TopLayoutBlog component when props are updated', () => {
      const mockUpdateProps = jest.fn();
      mocks TopLayoutBlog = { updateProps: mockUpdateProps };
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(mockUpdateProps).not.toHaveBeenCalled();
    });

    it('calls TopLayoutBlog component when rendered with form submission', () => {
      const mockSubmit = jest.fn();
      mocks TopLayoutBlog = { submit: mockSubmit };
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('side effects', () => {
    it('renders loading state when TopLayoutBlog component is rendering', async () => {
      mocks TopLayoutBlog = { render: jest.fn() };
      const { getByText } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(getByText(/loading/i)).toBeTruthy());
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });
  });
});