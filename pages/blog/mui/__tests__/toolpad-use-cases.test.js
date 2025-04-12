import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './toolpad-use-cases.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    // reset the mocks before each test
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // clear the mock results after each test
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('should render TopLayoutBlog with docs prop', async () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toContainHTML('TopLayoutBlog');
    });

    it('should not render if docs prop is null or undefined', async () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).not.toContainHTML('TopLayoutBlog');

      const { container: secondContainer } = render(<TopLayoutBlog docs={undefined} />);
      expect(secondContainer).not.toContainHTML('TopLayoutBlog');
    });
  });

  describe('Prop Validation', () => {
    it('should validate props', async () => {
      // test with valid props
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toContainHTML('TopLayoutBlog');

      // test with invalid prop
      const { error } = render(<TopLayoutBlog docs={} />);
      expect(error).not.toBeNull();
    });

    it('should not validate props', async () => {
      // test with valid props
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toContainHTML('TopLayoutBlog');

      // test with invalid prop
      const { error } = render(<TopLayoutBlog docs={null} />);
      expect(error).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should handle click on TopLayoutBlog', async () => {
      const mockOnClick = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onClick={mockOnClick} />);
      const buttonElement = getByText('TopLayoutBlog');
      fireEvent.click(buttonElement);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle input change in TopLayoutBlog', async () => {
      const mockOnChangeInput = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onChangeInput={mockOnChangeInput} />);
      const inputElement = getByText('input');
      fireEvent.change(inputElement, { target: { value: 'test' } });
      expect(mockOnChangeInput).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', async () => {
      const mockOnSubmit = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onSubmit={mockOnSubmit} />);
      const buttonElement = getByText('submit');
      fireEvent.click(buttonElement);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('should have the expected state after rendering', async () => {
    // Render the component
    const { container } = render(<TopLayoutBlog docs={docs} />);
    // Wait for the state to be updated
    await waitFor(() => expect(container).toContainHTML('TopLayoutBlog'));
  });
});