import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './may-2019-update.md?muiMarkdown';

describe('Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<Page />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog with docs prop', async () => {
      const { container } = render(<Page />);
      expect(
        container.querySelector('TopLayoutBlog')
      ).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog without docs prop', async () => {
      const { container } = render(<Page />); // eslint-disable-line no-unused-vars
      expect(container.querySelector('TopLayoutBlog')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('renders with valid docs prop', async () => {
      const { container } = render(<Page docs={docs} />);
      expect(
        container.querySelector('TopLayoutBlog')
      ).toBeInTheDocument();
    });

    it('throws an error when docs prop is missing', async () => {
      expect(() =>
        render(<Page />) // eslint-disable-line no-unused-vars
      ).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('renders correctly after clicking on a link', async () => {
      const { getByText } = render(<Page />);
      const link = getByText('/docs');
      fireEvent.click(link);
      expect(getByText('Link Text')).toBeInTheDocument();
    });

    it('updates input value after typing in the search bar', async () => {
      const { getByPlaceholderText, getByValueText } =
        render(<Page />);
      const searchInput = getByPlaceholderText('Search Bar');
      const searchButton = getByValueText('Search');
      fireEvent.change(searchInput, { target: { value: 'search' } });
      expect(getByPlaceholderText('Search Bar')).toHaveValue('search');
    });

    it('submits the form after pressing enter', async () => {
      const { getByPlaceholderText, getByText } =
        render(<Page />);
      const searchInput = getByPlaceholderText('Search Bar');
      const searchButton = getByText('Search');
      fireEvent.change(searchInput, { target: { value: 'search' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 13 });
      expect(getByPlaceholderText('Search Bar')).toHaveValue('');
    });

    it('does not submit the form when pressing enter on an empty search input', async () => {
      const { getByPlaceholderText } =
        render(<Page />);
      const searchInput = getByPlaceholderText('Search Bar');
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 13 });
      expect(getByPlaceholderText('Search Bar')).toHaveValue('');
    });
  });

  describe('Side Effects or State Changes', () => {
    it('renders correctly after setting the state', async () => {
      const { getByText } = render(<Page />);
      fireEvent.change(getByText('search'), { target: { value: 'search' } });
      expect(getByText('Link Text')).toBeInTheDocument();
    });

    it('does not update the state when setting a non-existent prop', async () => {
      const { getByPlaceholderText, getByValueText } =
        render(<Page />);
      fireEvent.change(getByPlaceholderText('Search Bar'), {
        target: { value: 'search' },
      });
      expect(getByPlaceholderText('Search Bar')).toHaveValue('');
    });

    it('does not throw an error when setting a valid prop', async () => {
      const { getByText } = render(<Page />);
      fireEvent.change(getByText('/docs'), { target: { value: '/docs' } });
      expect(getByText('/docs')).toBeInTheDocument();
    });
  });

  // Snapshot tests
  it('renders correctly with docs prop', () => {
    const { asFragment } = render(<TopLayoutBlog docs={docs} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render when docs prop is missing', () => {
    const { container } = render(<TopLayoutBlog />); // eslint-disable-line no-unused-vars
    expect(container).not.toHaveClass('TopLayoutBlog');
  });
});