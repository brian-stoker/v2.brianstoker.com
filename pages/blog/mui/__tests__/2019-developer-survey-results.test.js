import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2019-developer-survey-results.md?muiMarkdown';

jest.mock('./src/modules/components/TopLayoutBlog');

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<Page />);
  });

  describe('Rendering and Props', () => {
    it('renders without crashing', () => {
      expect(page).toMatchSnapshot();
    });

    it('renders with valid props', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeInTheDocument();
    });

    it('props validation', () => {
      const invalidDocs = undefined;
      render(<TopLayoutBlog docs={invalidDocs} />);
      expect(page).not.toHaveClass('error');
      const getByText = page.getByText;
      expect(getByText).toThrowError('docs is required');

      const validDocs = 'invalid';
      render(<TopLayoutBlog docs={validDocs} />);
      expect(page).toHaveClass('error');
    });
  });

  describe('Conditional Rendering', () => {
    it('renders child component only when provided', () => {
      const mockRenderChildren = jest.fn();
      TopLayoutBlog.defaultProps.renderChildren = mockRenderChildren;
      render(<TopLayoutBlog docs={docs} />);
      expect(mockRenderChildren).toHaveBeenCalledTimes(1);
    });

    it('does not render child component by default', () => {
      TopLayoutBlog.defaultProps.renderChildren = false;
      render(<TopLayoutBlog docs={docs} />);
      expect(TopLayoutBlog.prototype.children).toBeUndefined();
    });
  });

  describe('User Interactions and State Changes', () => {
    it('renders correctly on click of the page', () => {
      const { getByText } = page;
      fireEvent.click(getByText(docs.title));
      expect(page).toMatchSnapshot();
    });

    it('updates props state on renderChildren change', () => {
      const mockSetRenderChildren = jest.fn(() => ({ defaultProps: { renderChildren: false } }));
      TopLayoutBlog.defaultProps.renderChildren = true;
      render(<TopLayoutBlog docs={docs} />);
      expect(TopLayoutBlog.prototype.setRenderChildren).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshots', () => {
    it('renders correctly with snapshot test', () => {
      const { asFragment } = page;
      expect(asFragment()).toMatchSnapshot();
    });
  });
});