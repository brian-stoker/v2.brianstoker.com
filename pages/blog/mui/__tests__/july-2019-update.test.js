import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './july-2019-update.md?muiMarkdown';

describe('Page component', () => {
  beforeEach(() => {
    // reset the document before each test
    jest.resetAllMocks();
  });

  afterEach(() => {
    // clear all mocks after each test
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('should render TopLayoutBlog component with docs prop', () => {
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(container).toMatchSnapshot();
    });

    it('should not render anything when docs prop is null or undefined', () => {
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).toBeEmptyDOMElement();

      const { container: secondContainer } = render(<TopLayoutBlog docs={undefined} />);
      expect(secondContainer).toBeEmptyDOMElement();
    });
  });

  describe('prop validation', () => {
    it('should throw an error when docs prop is null or undefined', async () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).toThrow();

      expect(() => render(<TopLayoutBlog docs={undefined} />)).toThrow();
    });

    it('should not throw an error when docs prop is a string', async () => {
      const { container } = render(<TopLayoutBlog docs="docs" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should trigger click event on the component', async () => {
      const mockClickHandler = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} onClick={mockClickHandler} />);
      const linkElement = getByText('Link');
      fireEvent.click(linkElement);
      expect(mockClickHandler).toHaveBeenCalledTimes(1);
    });

    it('should update the docs prop when the input changes', async () => {
      const { getByPlaceholderText, getByLabelText } = render(<TopLayoutBlog docs={docs} />);
      const inputField = getByPlaceholderText('Docs');
      fireEvent.change(inputField, { target: { value: 'new Docs' } });
      expect(TopLayoutBlog.props.docs).toBe('new Docs');
    });

    it('should not submit the form when the docs prop is a string', async () => {
      const { getByLabelText } = render(<TopLayoutBlog docs="docs" />);
      const submitButton = getByLabelText('Submit');
      fireEvent.submit(submitButton);
      expect(TopLayoutBlog.props.docs).toBe('docs');
    });
  });

  describe('side effects or state changes', () => {
    it('should trigger a side effect when the component mounts', async () => {
      const mockSideEffect = jest.fn();
      const { container } = render(<TopLayoutBlog docs={docs} useEffect={mockSideEffect} />);
      expect(mockSideEffect).toHaveBeenCalledTimes(1);
    });
  });

  describe('mocks and dependencies', () => {
    it('should use the correct docs prop when rendering', async () => {
      jest.spyOn(TopLayoutBlog, 'useDocs');
      const { container } = render(<TopLayoutBlog docs={docs} />);
      expect(TopLayoutBlog.useDocs).toHaveBeenCalledTimes(1);
      expect(TopLayoutBlog.useDocs).toHaveBeenCalledWith(docs);
    });

    it('should not throw an error when rendering with a mock', async () => {
      jest.spyOn(TopLayoutBlog, 'useDocs');
      const { container } = render(<TopLayoutBlog docs={null} />);
      expect(container).toBeInTheDocument();
    });
  });
});