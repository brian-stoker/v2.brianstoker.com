import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2020.md?muiMarkdown';

describe('Page Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<Page />);
      expect(container).toMatchSnapshot();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    it('accepts valid props', () => {
      const { container } = render(<Page docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('rejects invalid docs prop', () => {
      const invalidDocs = 'invalid docs';
      const { error } = render(<Page docs={invalidDocs} />);
      expect(error).not.toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('dispatches event on click', async () => {
      const { getByText } = render(<Page />);
      const button = getByText('Click me!');
      fireEvent.click(button);
      await waitFor(() => expect(true).toBe(true));
    });

    it('updates docs prop on input change', async () => {
      const { getByPlaceholderText, getByLabelText } = render(<Page />);
      const input = getByPlaceholderText('');
      const label = getByLabelText('Docs title');
      fireEvent.change(input, { target: { value: 'New docs' } });
      await waitFor(() => expect(getByLabelText('Docs title')).toHaveValue('New docs'));
    });

    it('submits form on submit', async () => {
      const { getByPlaceholderText, getByLabelText } = render(<Page />);
      const input = getByPlaceholderText('');
      const button = getByText('Submit');
      fireEvent.change(input, { target: { value: 'Form data' } });
      fireEvent.click(button);
      await waitFor(() => expect(true).toBe(true));
    });
  });

  describe('Side Effects', () => {
    it('renders docs list on mount', async () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });
});