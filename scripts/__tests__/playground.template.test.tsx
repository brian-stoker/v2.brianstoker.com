import { render, fireEvent, waitFor } from '@testing-library/react';
import Playground from './Playground.template';
import { screen } from '@testing-library/react-dom';

describe('Playground component', () => {
  let mockComponent;

  beforeEach(() => {
    mockComponent = jest.fn();
    render(<Playground />, document.body);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      const { container } = render(<Playground />);
      expect(container).not.toBeNull();
    });
  });

  describe('Props validation', () => {
    it('accepts valid props', () => {
      const props = { children: 'Some text' };
      render(<Playground {...props} />);
      expect(mockComponent).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid props - missing children prop', async () => {
      const props = {};
      const { error } = render(<Playground {...props} />);
      expect(error).not.toBeNull();
    });
  });

  describe('Conditional rendering', () => {
    it('renders children when provided', () => {
      const text = 'Some text';
      const props = { children: text };
      render(<Playground {...props} />);
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('does not render children by default', async () => {
      render(<Playground />);
      expect(screen.queryByText('A playground for a fast iteration development cycle in isolation outside of git')).toBeNull();
    });
  });

  describe('User interactions', () => {
    it('responds to clicks on the component', async () => {
      const onClick = jest.fn();
      render(<Playground onClick={onClick} />);
      fireEvent.click(screen.getByText('A playground for a fast iteration development cycle in isolation outside of git'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('responds to input changes on the component', async () => {
      const onChange = jest.fn();
      render(<Playground onChange={onChange} />);
      fireEvent.change(screen.getByText('A playground for a fast iteration development cycle in isolation outside of git'), { target: { value: 'New text' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('submits form when submitted', async () => {
      const onSubmit = jest.fn();
      render(<Playground onSubmit={onSubmit} />);
      fireEvent.submit(screen.getByText('A playground for a fast iteration development cycle in isolation outside of git'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Side effects and state changes', () => {
    it('renders only after DOM update is complete', async () => {
      const renderMock = jest.fn();
      await waitFor(() => renderMock());
      expect(mockComponent).toHaveBeenCalledTimes(1);
    });
  });

  test('snapshot test', () => {
    const props = { children: 'Some text' };
    render(<Playground {...props} />);
    expect(screen.getByText('A playground for a fast iteration development cycle in isolation outside of git')).toMatchSnapshot();
  });
});