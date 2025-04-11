import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './material-ui-v4-is-out.md?muiMarkdown';

describe('Page component', () => {
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

  it('renders docs prop correctly', () => {
    const { getByText } = page;
    expect(getByText('docs')).toBeInTheDocument();
  });

  it('calls TopLayoutBlog with correct props', async () => {
    const mockDocs = jest.fn(() => ({}));
    render(<Page docs={mockDocs} />);
    await waitFor(() => expect(mockDocs()).toHaveBeenCalledTimes(1));
  });

  describe('conditional rendering', () => {
    it('renders when docs prop is provided', () => {
      const { getByText } = page;
      expect(getByText('docs')).toBeInTheDocument();
    });

    it('does not render when docs prop is not provided', () => {
      render(<Page />);
      expect(page.queryByText('docs')).toBeNull();
    });
  });

  describe('prop validation', () => {
    it('should throw an error if docs prop is missing', () => {
      expect(() => render(<Page />)).toThrowError();
    });

    it('should validate the type of docs prop correctly', () => {
      const invalidDocs = 'invalid';
      expect(() => render(<Page docs={invalidDocs} />)).toThrowError();
    });
  });

  describe('user interactions', () => {
    it('calls onDocSelected when clicked on docs link', async () => {
      const mockOnDocSelected = jest.fn();
      page.getByText('docs').forEach((element) => {
        element.addEventListener('click', mockOnDocSelected);
      });
      fireEvent.click(page.getByText('docs'));
      await waitFor(() => expect(mockOnDocSelected).toHaveBeenCalledTimes(1));
    });

    it('calls onDocSelected when clicked on docs link in different doc', async () => {
      const mockOnDocSelected = jest.fn();
      page.getByText('docs').forEach((element) => {
        element.addEventListener('click', mockOnDocSelected);
      });
      fireEvent.click(page.getByText('different-doc'));
      await waitFor(() => expect(mockOnDocSelected).toHaveBeenCalledTimes(1));
    });

    it('calls onDocSelected when clicked on docs link in different doc in different component', async () => {
      const mockOnDocSelected = jest.fn();
      page.getByText('docs').forEach((element) => {
        element.addEventListener('click', mockOnDocSelected);
      });
      render(<OtherComponent />);
      fireEvent.click(page.getByText('different-doc'));
      await waitFor(() => expect(mockOnDocSelected).toHaveBeenCalledTimes(1));
    });
  });

  it('renders default layout when docs prop is not provided', () => {
    const { getByText } = render(<Page />);
    expect(getByText('default-layout')).toBeInTheDocument();
  });
});