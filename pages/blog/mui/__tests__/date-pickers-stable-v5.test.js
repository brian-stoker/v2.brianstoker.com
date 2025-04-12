import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './date-pickers-stable-v5.md?muiMarkdown';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(page).toBeTruthy();
    });

    it('renders TopLayoutBlog component with docs prop', () => {
      expect(page.container).toContainHTML `<TopLayoutBlog>`);
      expect(page.container).toContainHTML `<docs>`);
    });
  });

  describe('Props validation', () => {
    it('accepts valid docs prop', () => {
      const validDocs = { /* valid docs data */ };
      render(<Page docs={validDocs} />);
      expect(page.container).not.toContainHTML('<docs invalid="docs-prop"></docs>');
    });

    it('rejects invalid docs prop', () => {
      const invalidDocs = 'invalid-docs';
      render(<Page docs={invalidDocs} />);
      expect(page.container).toContainHTML('<docs invalid="docs-prop"></docs>');
    });
  });

  describe('User interactions', () => {
    it('does not trigger any errors on page load', async () => {
      await waitFor(() => {
        const error = document.querySelector('.error');
        expect(error).not.toBeInTheDocument();
      });
    });

    it('triggers a click event when button is clicked', async () => {
      const { getByText } = render(<Page />);
      const button = getByText('Click me!');
      fireEvent.click(button);
      expect(getByText('Clicked!')).toBeInTheDocument();
    });
  });
});