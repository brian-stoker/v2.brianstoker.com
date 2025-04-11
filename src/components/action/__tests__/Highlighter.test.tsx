import { render, fireEvent, waitFor } from '@testing-library/react';
import Highlighter from './Highlighter';

describe('Highlighter component', () => {
  beforeEach(() => {
    global.innerWidth = 1000;
    global.innerHeight = 500;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<Highlighter />);
    expect(container).toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('renders when selected is false', () => {
      const { container } = render(<Highlighter selected={false} />);
      expect(container).toMatchSnapshot();
    });

    it('renders when selected is true', () => {
      const { container } = render(<Highlighter selected={true} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('prop validation', () => {
    it('accepts valid disableBorder prop', () => {
      const { container } = render(<Highlighter disableBorder={true} />);
      expect(container).toBeInTheDocument();
    });

    it('rejects invalid disableBorder prop', () => {
      expect(() => render(<Highlighter disableBorder="invalid" />)).toThrowError(
        'disableBorder must be a boolean'
      );
    });
  });

  describe('user interactions', () => {
    const onClickMock = jest.fn();

    beforeEach(() => {
      render(<Highlighter onClick={onClickMock} />);
    });

    it('calls onClick prop when button is clicked', () => {
      fireEvent.click();
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('scrolls to button when ref is set', () => {
      const ref = { scrollIntoView: jest.fn() };
      render(<Highlighter ref={ref} />);
      fireEvent.click();
      expect(ref.scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('applies theme styles when sx is provided', async () => {
      const { getByText } = render(<Highlighter sx={{ color: 'red' }} />);
      expect(getByText('Highlighter')).toHaveStyle({
        color: 'red',
      });
    });

    it('does not apply theme styles when sx is not provided', async () => {
      const { getByText } = render(<Highlighter />);
      expect(getByText('Highlighter')).not.toHaveStyle({
        color: 'red',
      });
    });
  });

  describe('snapshot testing', () => {
    it('matches snapshot when disabled border is true', () => {
      const { container } = render(<Highlighter disableBorder={true} />);
      expect(container).toMatchSnapshot();
    });

    it('matches snapshot when selected is true', () => {
      const { container } = render(<Highlighter selected={true} />);
      expect(container).toMatchSnapshot();
    });
  });
});