// @flow
/* eslint-disable no-console */
import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-toolpad-beta-announcement.md?muiMarkdown';

describe('Page component', () => {
  const MockDocs = () => <div>Mock Docs</div>;
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Props', () => {
    it('renders without crashing', () => {
      expect(page.container).toMatchSnapshot();
    });

    it('renders with correct docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('accepts valid docs prop', () => {
      const mockDocs = MockDocs();
      const { rerender } = render(<Page docs={mockDocs} />);
      expect(rerender).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid docs prop', () => {
      const invalidDocs = 'Invalid Docs';
      expect(() => <Page docs={invalidDocs} />).toThrowError();
    });
  });

  describe('Conditional Rendering', () => {
    it('renders TopLayoutBlog component correctly', () => {
      const { getByText } = page;
      expect(getByText('Top Layout Blog')).toBeInTheDocument();
    });

    it('does not render anything when docs prop is null or undefined', () => {
      const nullDocs = null;
      const undefinedDocs = undefined;
      const { queryByText } = render(<Page docs={nullDocs} />);
      expect(queryByText(nullDocs)).toBeNull();

      const { queryByText } = render(<Page docs={undefinedDocs} />);
      expect(queryByText(undefinedDocs)).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('renders TopLayoutBlog component on click', async () => {
      const clickElement = page.getByText('Top Layout Blog');
      fireEvent.click(clickElement);
      await waitFor(() => expect(page).toMatchSnapshot());
    });

    it(' updates docs prop when user input changes', async () => {
      const { getByPlaceholderText } = page;
      const inputField = getByPlaceholderText('');
      fireEvent.change(inputField, { target: { value: 'New Docs' } });
      await waitFor(() => expect(page).toMatchSnapshot());
    });
  });

  describe('Side Effects and State Changes', () => {
    // TODO: Implement tests for side effects and state changes
  });
});