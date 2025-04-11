import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2023-toolpad-beta-announcement.md?muiMarkdown';

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
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });
  });

  describe('Props validation', () => {
    it('passes valid props to TopLayoutBlog', () => {
      const { getByText } = render(<Page docs={docs} />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('throws error for invalid prop types', () => {
      expect(() => render(<Page docs="invalid data" />)).toThrowError(
        'Invalid prop type for docs. Expected a string.'
      );
    });
  });

  describe('User interactions', () => {
    it('renders correctly when clicked', () => {
      const { getByText } = page;
      fireEvent.click(getByText(docs.title));
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('updates state when input changes', async () => {
      const inputField = await page.$('input');
      fireEvent.change(inputField, { target: { value: 'new text' } });
      expect(await page.$(`input[type="text"]`)).toHaveValue('new text');
    });
  });

  describe('Conditional rendering', () => {
    it('renders TopLayoutBlog component if docs prop is truthy', () => {
      const { getByText } = render(<Page />);
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('does not render if docs prop is falsy', () => {
      const pageWithFalsyDocs = render(<Page docs={null} />);
      expect(pageWithFalsyDocs.container).not.toContainElement(
        getByText(docs.title)
      );
    });
  });

  describe('Edge cases', () => {
    it('renders correctly when no props are passed', () => {
      const { container } = render(<Page />);
      expect(container).toBeInTheDocument();
    });

    it('renders correctly with an empty docs prop array', () => {
      const pageWithEmptyDocs = render(<Page docs={[]} />);
      expect(pageWithEmptyDocs.container).toBeInTheDocument();
    });
  });

  describe('Snapshot testing', () => {
    it('matches the expected snapshot', async () => {
      const { asFragment } = render(<Page />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});