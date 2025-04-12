import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './november-2019-update.md?muiMarkdown';

describe('Page Component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    expect(page).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = page;
      expect(getByText('November 2019 Update')).toBeInTheDocument();
    });

    it('does not render anything when docs prop is falsy', () => {
      page = render(<Page docs={false} />);
      expect(page.queryByTitle).toBeNull();
    });
  });

  describe('Props Validation', () => {
    it('accepts valid docs prop', () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText('November 2019 Update')).toBeInTheDocument();
    });

    it('rejects invalid docs prop', () => {
      const page = render(<Page docs="invalid" />);
      expect(page.queryByTitle).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('calls props function when doc title is clicked', async () => {
      const mockFunction = jest.fn();
      const { getByText } = render(<Page docs={docs} onClick={mockFunction} />);
      const button = getByText('November 2019 Update');
      fireEvent.click(button);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls props function when document is clicked', async () => {
      const mockFunction = jest.fn();
      const { getByText } = render(<Page docs={docs} onClick={mockFunction} />);
      const doc = getByText('November 2019 Update');
      fireEvent.click(doc);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls props function when input is changed', async () => {
      const mockFunction = jest.fn();
      const { getByPlaceholderText } = render(<Page docs={docs} onChange={mockFunction} />);
      const input = getByPlaceholderText('Enter your search query');
      fireEvent.change(input, { target: { value: 'search' } });
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('calls props function when form is submitted', async () => {
      const mockFunction = jest.fn();
      const { getByPlaceholderText } = render(<Page docs={docs} onSubmit={mockFunction} />);
      const input = getByPlaceholderText('Enter your search query');
      const button = getByText('Search');
      fireEvent.change(input, { target: { value: 'search' } });
      fireEvent.click(button);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly', () => {
      const renderedPage = render(<TopLayoutBlog docs={docs} />);
      expect(renderedPage).toMatchSnapshot();
    });
  });
});