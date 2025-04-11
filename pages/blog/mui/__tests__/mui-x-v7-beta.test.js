import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './mui-x-v7-beta.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    global.fetchMock.clearMocks();
    jest.mock('./mocks/fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('Conditional rendering', () => {
    it('renders when docs prop is provided', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toHaveTextContent(/example/);
    });

    it('does not render when docs prop is missing', () => {
      const { container } = render(<TopLayoutBlog />);
      expect(container).not.toHaveTextContent(/example/);
    });
  });

  describe('Props validation', () => {
    it('throws error when docs prop is invalid', async () => {
      await expect(() => render(<TopLayoutBlog docs={null} />)).toThrowError();
    });

    it('renders with valid docs prop', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    let mockFunction;

    beforeEach(() => {
      mockFunction = jest.fn();
    });

    it('calls mock function when button is clicked', async () => {
      const { getByText, getAllByRole } = render(<TopLayoutBlog docs={docs} />);
      const button = getByText('Example Button');
      fireEvent.click(button);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects', () => {
    it('calls API when component mounts', async () => {
      jest.mock('./mocks/fetch');
      const { container } = render(<TopLayoutBlog docs={docs} />);
      await waitFor(() => expect(global.fetchMock).toHaveBeenCalledTimes(1));
    });
  });

  it('renders snapshot correctly', () => {
    render(<TopLayoutBlog docs={docs} />);
    expect(getByRole('region')).toMatchSnapshot();
  });
});