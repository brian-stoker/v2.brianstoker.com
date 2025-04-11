import { render, fireEvent, screen } from '@testing-library/react';
import TopLayoutBlog from 'src/modules/components/TopLayoutBlog';
import { docs } from './toolpad-use-cases.md?muiMarkdown';

describe('Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(<TopLayoutBlog docs={docs} />);
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  it('renders TopLayoutBlog with valid props', async () => {
    const { getByText } = render(<TopLayoutBlog docs={docs} />);
    expect(getByText('Docs')).toBeInTheDocument();
  });

  it('throws an error when rendering with invalid props', async () => {
    expect(() =>
      render(<TopLayoutBlog docs="InvalidProps" />)
    ).toThrowError('Invalid props');
  });

  describe('conditional rendering', () => {
    it('renders TopLayoutBlog', async () => {
      render(<TopLayoutBlog docs={docs} />);
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('does not render TopLayoutBlog when no props', async () => {
      render(<TopLayoutBlog />);
      expect(screen.queryByText('Docs')).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('clicks on the component', async () => {
      const onClickMock = jest.fn();
      render(<TopLayoutBlog docs={docs} onClick={onClickMock} />);
      fireEvent.click(screen.getByText('Docs'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('inputs text into input fields', async () => {
      const setInputMock = jest.fn();
      render(<TopLayoutBlog docs={docs} />);
      const inputField = screen.getByPlaceholderText('Input Field');
      fireEvent.change(inputField, { target: { value: 'test' } });
      expect(setInputMock).toHaveBeenCalledTimes(1);
    });

    it('submits a form', async () => {
      const onSubmitMock = jest.fn();
      render(<TopLayoutBlog docs={docs} />);
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects and state changes', () => {
    it('calls the mock function on mount', async () => {
      const mockFunction = jest.fn();
      render(<TopLayoutBlog docs={docs} />, { initialState: { someState: true } });
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('does not call the mock function when unmounted', async () => {
      const mockFunction = jest.fn();
      render(<TopLayoutBlog docs={docs} />);
      await screen.findByRole('button');
      jest.resetAllMocks();
      render(<TopLayoutBlog docs={docs} />, { initialState: { someState: true } });
      expect(mockFunction).not.toHaveBeenCalled();
    });
  });

  describe('snapshot test', () => {
    it('renders correctly', async () => {
      const rendered = await render(<TopLayoutBlog docs={docs} />);
      expect(rendered).toMatchSnapshot();
    });
  });
});