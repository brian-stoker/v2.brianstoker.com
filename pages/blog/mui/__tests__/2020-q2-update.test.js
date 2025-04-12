import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020-q2-update.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders without crashing', () => {
    it('renders the TopLayoutBlog component', () => {
      expect(page.container).toHaveTextContent('TopLayoutBlog');
    });
  });

  describe('Conditional rendering', () => {
    it('renders the docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs)).toBeInTheDocument();
    });

    it('does not render the docs prop if empty', () => {
      docs = '';
      const { queryByText } = page;
      expect(queryByText('')).not.toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('accepts the docs prop as a string', () => {
      const { getByText } = page;
      expect(getByText(docs)).toBeInTheDocument();
    });

    it('rejects empty props', () => {
      docs = '';
      const { queryByText } = page;
      expect(queryByText('')).not.toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('renders the component with a click', () => {
      const button = page.getByRole('button');
      fireEvent.click(button);
      expect(page).toHaveTextContent(docs);
    });

    it('renders the component with an input change', () => {
      const input = page.getByTestId('input');
      fireEvent.change(input, { target: { value: docs } });
      expect(page).toHaveTextContent(docs);
    });
  });

  describe('Side effects or state changes', () => {
    it('does not update the docs prop when submitting a form', async () => {
      const input = page.getByTestId('input');
      const submitButton = page.getByRole('button');
      fireEvent.change(input, { target: { value: docs } });
      fireEvent.click(submitButton);
      await waitFor(() => expect(page).toHaveTextContent(docs));
    });
  });

  describe('Snapshot test', () => {
    it('renders the component with the correct structure', () => {
      expect(render(<Page />)).toMatchSnapshot();
    });
  });
});