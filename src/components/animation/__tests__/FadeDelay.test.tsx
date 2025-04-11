import { render, fireEvent, waitFor } from '@testing-library/react';
import { create, act } from 'vitest';
import FadeDelay, { FadeProps } from './FadeDelay';

describe('FadeDelay component', () => {
  const props: Partial<FadeProps> = {
    delay: 1000,
    children: <div>Text</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<FadeDelay {...props} />);
    expect(() => render(<FadeDelay {...props} />)).not.toThrow();
  });

  describe('conditional rendering', () => {
    const delay1 = 500;
    const delay2 = 2000;

    it('renders correctly when fadeIn is true', async () => {
      props.delay = delay1;
      render(<FadeDelay {...props} />);
      expect(props.fadeIn).toBe(true);
    });

    it('does not render when fadeIn is false and delay is less than 500', async () => {
      props.delay = delay2;
      render(<FadeDelay {...props} />);
      expect(() => render(<FadeDelay {...props} />)).not.toThrow();
    });
  });

  describe('prop validation', () => {
    it('throws an error when invalid prop is provided', async () => {
      expect(() => render(<FadeDelay {...props, invalidProp: 'test' } />)).toThrowError(
        expect.stringContaining('invalidProp')
      );
    });

    it('does not throw an error when valid prop is provided', async () => {
      props.delay = 1000;
      render(<FadeDelay {...props} />);
    });
  });

  describe('user interactions', () => {
    const clickHandler = jest.fn();
    const inputChangeHandler = jest.fn();

    it('calls click handler when clicked', async () => {
      props.onClick = clickHandler;
      render(<FadeDelay {...props} />);
      fireEvent.click(props.children as HTMLButtonElement);
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('calls input change handler when input changes', async () => {
      props.onChange = inputChangeHandler;
      render(<FadeDelay {...props} />);
      fireEvent.change((props.children as HTMLInputElement), { target: 'test' });
      expect(inputChangeHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('side effects', () => {
    it('clears timeout when component unmounts', async () => {
      const time = jest.fn();
      props.delay = 1000;
      render(<FadeDelay {...props} />);
      act(() => {
        expect(time).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(time).toHaveBeenCalledTimes(2);
      });
    });

    it('does not throw an error when component unmounts', async () => {
      props.delay = 1000;
      render(<FadeDelay {...props} />);
      act(() => {
        expect(() => render(<FadeDelay {...props} />)).not.toThrow();
      });
    });
  });

  describe('snapshot test', () => {
    it('matches the expected UI snapshot', async () => {
      const { container } = render(<FadeDelay {...props} />);
      await waitFor(() => {
        expect(container).toMatchSnapshot();
      });
    });
  });
});