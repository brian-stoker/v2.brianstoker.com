import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-chamonix-retreat.md?muiMarkdown';

describe('Page component', () => {
  let renderComponent;

  beforeEach(() => {
    renderComponent = (props) => render(<Page {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render with valid props', () => {
    it('renders without crashing', async () => {
      const { container } = renderComponent({ docs });
      expect(container).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', async () => {
      const { getByText } = renderComponent({ docs });
      expect(getByText('2023 Chamonix Retreat')).toBeInTheDocument();
    });
  });

  describe('Render with invalid props', () => {
    it('throws an error if docs prop is missing', async () => {
      expect(() => renderComponent()).toThrowError(
        'docs prop is required',
      );
    });

    it('renders TopLayoutBlog component with empty docs prop', async () => {
      const { container } = renderComponent({ docs: '' });
      expect(container).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    it('triggers an error when clicking the back button', async () => {
      const { getByRole, getByText } = renderComponent({ docs });
      const backButton = getByRole('button');
      fireEvent.click(backButton);
      expect(getByText('Error: Back button clicked')).toBeInTheDocument();
    });

    it('updates the search query on input change', async () => {
      const { getByPlaceholderText, getByText } = renderComponent({ docs });
      const inputField = getByPlaceholderText('Search...');
      const updateQuery = 'newQuery';
      fireEvent.change(inputField, { target: { value: updateQuery } });
      expect(getByText(`Updated query: ${updateQuery}`)).toBeInTheDocument();
    });

    it('submits the form when clicking the submit button', async () => {
      const { getByRole, getByText } = renderComponent({ docs });
      const submitButton = getByRole('button');
      fireEvent.click(submitButton);
      expect(getByText('Form submitted successfully')).toBeInTheDocument();
    });
  });

  describe('Conditional rendering', () => {
    it('renders the default message when no documents are available', async () => {
      const { getByText } = renderComponent({ docs: null });
      expect(getByText('No documents found')).toBeInTheDocument();
    });

    it('renders a loading indicator while fetching documents', async () => {
      const { getByRole, getByText } = renderComponent({ docs: undefined });
      const loadingIndicator = getByRole('button');
      fireEvent.click(loadingIndicator);
      expect(getByRole('heading')).toHaveTextContent('Loading...');
    });

    it('renders the search results when documents are found', async () => {
      const { getAllByRole, getByText } = renderComponent({ docs });
      const searchResults = getAllByRole('link');
      expect(searchResults.length).toBeGreaterThan(0);
      expect(getByText('2023 Chamonix Retreat')).toBeInTheDocument();
    });

    it('renders the no results message when no documents are found', async () => {
      const { getByText } = renderComponent({ docs: null });
      expect(getByText('No documents found')).toBeInTheDocument();
    });
  });

  describe('Snapshot test', () => {
    it('matches the snapshot for the rendered component', async () => {
      const { asFragment } = renderComponent({ docs });
      expect(asFragment()).toMatchSnapshot();
    });
  });
});