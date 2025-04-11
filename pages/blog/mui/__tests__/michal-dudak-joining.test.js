import * as React from 'react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './michal-dudak-joining.md?muiMarkdown';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('Page component', () => {
  let page;

  beforeEach(() => {
    page = render(<TopLayoutBlog docs={docs} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renders without crashing', () => {
    it('should not throw an error when rendering', () => {
      expect(page).toBeTruthy();
    });
  });

  describe('conditional rendering', () => {
    it('should render the top layout blog component', () => {
      const { container } = page;
      expect(container).toContainHTML(<TopLayoutBlog docs={docs} />);
    });

    it('should not throw an error when no props are passed to the component', () => {
      expect(() => render(<TopLayoutBlog />)).not.toThrowError();
    });
  });

  describe('prop validation', () => {
    const invalidDocsProp = null;

    it('should validate and render correctly with valid docs prop', () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeTruthy();
    });

    it('should throw an error when no valid docs prop is passed to the component', () => {
      expect(() => render(<TopLayoutBlog docs={invalidDocsProp} />)).toThrowError(
        expect.stringContaining('docs must be a non-empty string')
      );
    });
  });

  describe('user interactions', () => {
    const mockGetByText = jest.fn();

    beforeEach(() => {
      page = render(<TopLayoutBlog docs={docs} />);
    });

    it('should update the docs prop correctly on user interaction', () => {
      const { getByText } = page;
      expect(mockGetByText).not.toHaveBeenCalled();
      fireEvent.click(getByText(docs.title));
      expect(mockGetByText).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects or state changes', () => {
    it('should update the docs prop correctly when rendering', async () => {
      const { getByText } = page;
      expect(getByText(docs.title)).toBeTruthy();
      await waitFor(() => expect(getByText(docs.title)).toBeInTheDocument());
    });
  });
});

export default {};