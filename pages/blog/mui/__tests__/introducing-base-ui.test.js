import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './introducing-base-ui.md?muiMarkdown';

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

    it('renders TopLayoutBlog component with docs prop', () => {
      expect(page.getByText('Introduction to Base UI')).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('accepts valid docs prop', () => {
      expect(DocsPropValidator().isValid(page.props.docs)).toBe(true);
    });

    it('rejects invalid docs prop (non-object)', () => {
      const invalidDocs = 'invalid docs';
      expect(DocsPropValidator().isValid(invalidDocs)).toBe(false);
    });
  });

  describe('User interactions', () => {
    it('renders TopLayoutBlog component on mount', () => {
      expect(page.getByText('Introduction to Base UI')).toBeInTheDocument();
    });

    it('calls docs prop when clicked', async () => {
      const openDocSpy = jest.spyOn(page.getByText('Introduction to Base UI'), 'onClick');
      fireEvent.click(page.getByText('Introduction to Base UI'));
      await waitFor(() => expect(openDocSpy).toHaveBeenCalledTimes(1));
    });
  });

  describe('Snapshot tests', () => {
    it('renders snapshot of Page component', () => {
      expect(render(<Page />)).toMatchSnapshot();
    });
  });
});

function DocsPropValidator() {
  const isValid = (value) => typeof value === 'object';
  return { isValid };
}