import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './june-2019-update.md?muiMarkdown';

describe('Page', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Renders without crashing', () => {
    it('renders the component', () => {
      expect(page).toBeTruthy();
    });
  });

  describe('Conditional rendering paths', () => {
    const noDocs = { docs: null };
    const emptyDocs = { docs: {} };

    it('renders with docs prop', () => {
      render(<Page />); // This should be the main test, but let's add another to confirm.
    });

    it('renders without docs prop', () => {
      render(<Page props={{ docs: null }} />);
    });
  });

  describe('Props validation', () => {
    it('validates docs prop with valid data', () => {
      expect(render(<Page props={{ docs: docs }} />)).toBeTruthy();
    });

    it('validates docs prop with invalid data', () => {
      expect(() => render(<Page props={{ docs: 'invalid' }} />)).toThrowError(
        'Invalid docs prop type',
      );
    });
  });

  describe('User interactions', () => {
    const mockUpdate = jest.fn();

    beforeEach(() => {
      page = render(<Page />);
      fireEvent.mouseDown(page.getByPlaceholderText('search'));
      fireEvent.click(page.getByRole('button', { name: /update/i }));
    });

    it('updates the docs prop', () => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot test', () => {
    it('matches the snapshot', () => {
      const tree = render(<Page />);
      expect(tree).toMatchSnapshot();
    });
  });
});