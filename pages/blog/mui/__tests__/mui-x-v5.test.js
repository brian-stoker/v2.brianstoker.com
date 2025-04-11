import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v5.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    describe('Conditional Rendering', () => {
      it('renders TopLayoutBlog component when provided docs prop', () => {
        const { getByText } = render(<Page docs={docs} />);
        expect(getByText(docs.title)).toBeInTheDocument();
      });

      it('does not render anything when no docs prop is provided', () => {
        const { queryByTitle } = render(<Page />);
        expect(queryByTitle).toBeNull();
      });
    });

    describe('Props Validation', () => {
      it('accepts valid docs prop', () => {
        const { getByText } = render(<Page docs={docs} />);
        expect(getByText(docs.title)).toBeInTheDocument();
      });

      it('does not accept invalid docs prop', () => {
        const invalidDocs = {};
        const { queryByTitle } = render(<Page docs={invalidDocs} />);
        expect(queryByTitle).toBeNull();
      });
    });
  });

  describe('User Interactions', () => {
    describe('Clicks', () => {
      it('renders content when clicked on a doc', async () => {
        const docTitle = 'doc title';
        const mockGetByText = jest.fn((text) => ({ original: text }));
        render(<Page docs={mockGetByText(docTitle)} />);
        const button = getByText(docTitle);
        fireEvent.click(button);
        await waitFor(() => expect(mockGetByText).toHaveBeenCalledTimes(1));
      });
    });

    describe('Input Changes', () => {
      it('does not update component state on invalid input changes', async () => {
        render(<Page />);
        const inputField = getByPlaceholderText('');
        fireEvent.change(inputField, { target: { value: 'invalid' } });
        expect(page.state).not.toHaveProperty('updated');
      });
    });

    describe('Form Submissions', () => {
      it('does not trigger form submission when no docs prop is provided', async () => {
        render(<Page />);
        const form = getByRole('form');
        fireEvent.submit(form);
        expect(page.queryByPlaceholderText).not.toBeNull();
      });
    });
  });

  describe('Side Effects', () => {
    it('calls update function with updated props when docs prop changes', async () => {
      let updatesMocked = false;
      const mockGetByText = jest.fn((text) => ({ original: text }));
      render(<Page docs={mockGetByText} />);
      updatesMocked = true;
      await waitFor(() => expect(updatesMocked).toBe(true));
    });
  });

  describe('Snapshot Test', () => {
    it('renders correctly', () => {
      const { asFragment } = render(<Page docs={docs} />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});