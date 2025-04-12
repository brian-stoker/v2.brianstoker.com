import { render, fireEvent, waitFor } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './august-2019-update.md?muiMarkdown';

describe('TopLayoutBlog component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toBeTruthy();
  });

  describe('conditional rendering', () => {
    it('renders correctly when docs prop is an object', async () => {
      const { container } = render(<TopLayoutBlog docs={{ title: 'Test Doc' }} />);
      expect(container).toHaveTextContent(/Test Doc/);
    });

    it('renders correctly when docs prop is an array', async () => {
      const { container } = render(<TopLayoutBlog docs={['Doc 1', 'Doc 2']} />);
      expect(container).toHaveTextContent(/Doc 1/);
    });
  });

  describe('prop validation', () => {
    it('throws an error when docs prop is null or undefined', async () => {
      expect(() => render(<TopLayoutBlog docs={null} />)).toThrow();
      expect(() => render(<TopLayoutBlog docs={undefined} />)).toThrow();
    });

    it('throws an error when docs prop is not an object or array', async () => {
      expect(() => render(<TopLayoutBlog docs={'Invalid Doc'} />)).toThrow();
      expect(() => render(<TopLayoutBlog docs={123} />)).toThrow();
    });
  });

  describe('user interactions', () => {
    it('calls the handleDocClick prop when clicked', async () => {
      const handleDocClick = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} handleDocClick={handleDocClick} />);
      expect(getByText(docs.title)).toHaveAttribute('data-test', 'doc-click');
      fireEvent.click(getByText(docs.title));
      expect(handleDocClick).toHaveBeenCalledTimes(1);
    });

    it('calls the handleDocInput prop when input changed', async () => {
      const handleDocInput = jest.fn();
      const { getByText } = render(<TopLayoutBlog docs={docs} handleDocInput={handleDocInput} />);
      expect(getByText(docs.title)).toHaveAttribute('data-test', 'doc-input');
      fireEvent.change(getByText(docs.title), { target: { value: 'New Doc' } });
      expect(handleDocInput).toHaveBeenCalledTimes(1);
    });

    it('calls the handleFormSubmit prop when form submitted', async () => {
      const handleFormSubmit = jest.fn();
      const { getByText, getByRole } = render(<TopLayoutBlog docs={docs} handleFormSubmit={handleFormSubmit} />);
      expect(getByText(docs.title)).toHaveAttribute('data-test', 'form-submit');
      fireEvent.click(getByRole('button', { name: 'Submit' }));
      expect(handleFormSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('renders correctly when rendering docs array', async () => {
      const { container } = render(<TopLayoutBlog docs={['Doc 1', 'Doc 2']} />);
      expect(container).toHaveTextContent(/Doc 1/);
      expect(container).toHaveTextContent(/Doc 2/);
    });

    it('renders correctly when rendering docs object', async () => {
      const { container } = render(<TopLayoutBlog docs={{ title: 'Test Doc' }} />);
      expect(container).toHaveTextContent(/Test Doc/);
    });
  });

  it('snaps a test for the correct rendered component', async () => {
    const { container } = render(<TopLayoutBlog docs={docs} />);
    expect(container).toMatchSnapshot();
  });
});