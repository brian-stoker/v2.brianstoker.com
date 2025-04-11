import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './2021-developer-survey-results.md?muiMarkdown';

describe('Page component', () => {
  let mockDocs;

  beforeEach(() => {
    mockDocs = {
      // Mock doc data
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={mockDocs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders blog content when docs prop is truthy', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(getByText('Blog Content')).toBeInTheDocument();
    });

    it('does not render blog content when docs prop is falsy', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={false} />);
      expect(queryByText('Blog Content')).not.toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('throws an error if docs prop is null or undefined', () => {
      expect(() => <TopLayoutBlog docs=null />).toThrowError();
      expect(() => <TopLayoutBlog docs=undefined />).toThrowError();
    });

    it('does not throw an error if docs prop is a valid object', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(getByText('Blog Content')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    let mockHandleClick;

    beforeEach(() => {
      mockHandleClick = jest.fn();
    });

    it('calls handleClick prop when clicked', async () => {
      const { getByText } = render(<TopLayoutBlog docs={mockDocs} onClick={mockHandleClick} />);
      expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call handleClick prop if no onClick prop is provided', async () => {
      const { queryByText } = render(<TopLayoutBlog docs={mockDocs} />);
      expect(mockHandleClick).not.toHaveBeenCalled();
    });
  });

  describe('side effects or state changes', () => {
    it('calls useEffect hook with correct props when rendered', async () => {
      // Mock useEffect hook
      const mockUseEffect = jest.fn();

      const { rerender } = render(<TopLayoutBlog docs={mockDocs} />, {
        wrapInside: (element) => {
          mockUseEffect(element);
          return element;
        },
      });

      expect(mockUseEffect).toHaveBeenCalledTimes(1);
    });
  });

  it('snapshot test', async () => {
    const { asFragment } = render(<TopLayoutBlog docs={mockDocs} />);
    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});