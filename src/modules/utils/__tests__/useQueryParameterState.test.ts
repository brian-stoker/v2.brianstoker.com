import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQueryParameterState } from './useQueryParameterState.test.ts';

describe('useQueryParameterState', () => {
  const initialValues = ['value1', 'value2'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<useQueryParameterState name="test" />);
    expect(container).toBeTruthy();
  });

  describe('Conditional Rendering', () => {
    it('renders initial value when initialValue is provided', () => {
      const { getByText } = render(
        <useQueryParameterState name="test" initialValue={initialValues[0]} />,
      );
      expect(getByText(initialValues[0])).toBeInTheDocument();
    });

    it('renders initial query param value when queryParamValue is available', () => {
      const { getByText } = render(
        <useQueryParameterState name="test" initialValue={''} />,
      );
      window.history.pushState({}, '', '?test=value1');
      expect(getByText('value1')).toBeInTheDocument();
    });

    it('renders empty string when both initialValue and queryParamValue are not provided', () => {
      const { getByText } = render(<useQueryParameterState name="test" />);
      expect(getByText('')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('throws an error when initialValue is not a string', () => {
      expect(() =>
        render(
          <useQueryParameterState name="test" initialValue={1} />,
        ),
      ).toThrowError();
    });

    it('throws an error when queryParamValue is not a string array', () => {
      expect(() =>
        render(
          <useQueryParameterState name="test" initialValue={''} />,
        ),
      ).toThrowError();
    });
  });

  describe('User Interactions', () => {
    it('updates state and URL parameter value when setUserState is called', () => {
      const { getByText } = render(<useQueryParameterState name="test" />);
      const inputField = getByTestId('input-field');
      userEvent.type(inputField, 'new-value');

      expect(window.history.search).toBe('?test=new-value');
    });

    it('does not update URL parameter value when setUserState is called with an empty string', () => {
      const { getByText } = render(<useQueryParameterState name="test" />);
      const inputField = getByTestId('input-field');
      userEvent.type(inputField, '');

      expect(window.history.search).toBe('?test=');
    });
  });

  describe('Side Effects', () => {
    it('replaces the URL with a new search query when setUserState is called', async () => {
      const { getByText } = render(<useQueryParameterState name="test" />);
      const inputField = getByTestId('input-field');
      userEvent.type(inputField, 'new-value');

      await waitFor(() => expect(window.history.search).toBe('?test=new-value'));
    });
  });

  describe('Mocking', () => {
    it('mocks the useQueryParameterState hook to return an array with state and setUserState', () => {
      const { result } = renderHook(() =>
        useQueryParameterState('test', 'initial-value'),
      );
      expect(result.current[0]).toBe('initial-value');
      expect(result.current[1]()).toHaveBeenCalledTimes(1);
    });

    it('mocks the setUrlValue function to call router.replace with a new search query', async () => {
      const { result } = renderHook(() =>
        useQueryParameterState('test', 'initial-value'),
      );
      const [state, setUserState] = result.current;

      userEvent.type(getByTestId('input-field'), 'new-value');
      await waitFor(() => expect(router.replace).toHaveBeenCalledTimes(1));
    });
  });
});